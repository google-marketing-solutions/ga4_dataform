# pip install --upgrade google-cloud-dataform

# -*- coding: utf-8 -*-
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.cloud import dataform_v1beta1
import os
import json
import argparse
import datetime

PROJECT_SOURCE_PATH = "dataform_source_code"

def main(project_id, dataform_location, dataset_location):
    """Creates a Dataform project based on source code stored in a local directory.

    It first initializes the Dataform client, then creates a Dataform
    repository and workspace, and finally uploads the project source
    code files.
    """
    # Initialize a Dataform client
    client = dataform_v1beta1.DataformClient()

    # Create a Dataform reporsitory
    parent = f"projects/{project_id}/locations/{dataform_location}"
    repository_name = create_dataform_repository(client, parent)

    # Create a Dataform workspace
    workspace_name = create_dataform_workspace(client, repository_name)

    # Upload the project source code to the dataform repository workspace
    upload_source_files(client, workspace_name, PROJECT_SOURCE_PATH, project_id, dataset_location)

    # Initialize Workspace (This installs dataform/core and creats the package-lock.json file)
    install_npm_packages(client, workspace_name)


def create_dataform_repository(client, parent):
    """Creates a Dataform repository.

    Args:
        client: A Dataform Client instance.
        parent: The location of the Dataform project repository in the
        form projects/*/locations/*

    Returns:
        repository: The repository path in the form
        projects/*/locations/*/repositories/*
    """
    # Generate a unique repository id
    now = datetime.datetime.now()
    now = now.strftime("%Y%m%d%H%M%S")
    repository_id = f"ga4-dataform-{now}"

    # Initialize request argument(s)
    request = dataform_v1beta1.CreateRepositoryRequest(
        parent=parent,
        repository_id=repository_id,
    )

    # Make the request
    response = client.create_repository(request=request)
    print(f'Created Dataform repository: {response.name}')
    return response.name


def create_dataform_workspace(client, repository_name):
    """Creates a Dataform repository.

    Args:
        client: A Dataform Client instance.
        repository_name: The location of the Dataform project repository in the
        form projects/*/locations/*/repositories/*

    Returns:
        workspace: The name of the workspace
    """
    now = datetime.datetime.now()
    now = now.strftime("%Y%m%d%H%M%S")
    workspace_id = f"ga4-workspace-{now}"
    # Initialize request argument(s)
    request = dataform_v1beta1.CreateWorkspaceRequest(
        parent=repository_name,
        workspace_id=workspace_id,
    )

    # Make the request
    response = client.create_workspace(request=request)
    print(f'Created Dataform workspace: {response.name}')
    return response.name

def upload_source_files(client, workspace_name, project_source_path, project_id, dataset_location):
    """Uploads Dataform source code files to the Dataform repository.

    Args:
        client: A Dataform Client instance.
        workspace_name: The name of the workspace
        project_source_path: The path of the Dataform source code
        dataset_location: The location where the Dataform BQ datasets will be created
    """
    # Update the project's dataform.json project id and location values
    update_json_field(project_source_path + "/dataform.json", "defaultDatabase", project_id)

    update_json_field(project_source_path + "/dataform.json", "defaultLocation", dataset_location)

    # Check if the provided path exists and is a directory
    if not os.path.exists(project_source_path) or not os.path.isdir(project_source_path):
        print(f"{project_source_path} is not a valid directory.")
        return

    # Loop through the directory
    for root, dirs, files in os.walk(project_source_path):

        for dir_name in dirs:
            full_dir_path = os.path.join(root, dir_name)
            rel_dir_path = os.path.relpath(full_dir_path, project_source_path)
            if '.git' not in full_dir_path:
                print(f"Uploading folder: {rel_dir_path})")
                make_dataform_directory(client, workspace_name, rel_dir_path)

        for file_name in files:
            full_file_path = os.path.join(root, file_name)
            rel_file_path = os.path.relpath(full_file_path, project_source_path)
            if '.git' not in full_file_path:
                print(f"Uploading file: {rel_file_path})")
                write_dataform_file(client, workspace_name, full_file_path, rel_file_path)
                
                

def make_dataform_directory(client, workspace_name, rel_dir_path):
    """Creates a Dataform Directory.

    Args:
        client: A Dataform Client instance.
        workspace_name: The name of the workspace.
        rel_dir_path: The relative path of the directory to create
    """
    # Initialize request argument(s)
    request = dataform_v1beta1.MakeDirectoryRequest(
        workspace=workspace_name,
        path=rel_dir_path,
    )

    client.make_directory(request=request)

def write_dataform_file(client, workspace_name, full_file_path, rel_file_path):
    """Writes a Dataform File.

    Args:
        client: A Dataform Client instance.
        workspace: The name of the workspace.
        rel_file_path: The relative path of the file to create
    """
    #get file blob content
    try:
        with open(full_file_path, 'rb') as file:
            # Read the contents of the file into a bytes object
            blob_data = file.read()

    except FileNotFoundError:
        print(f"The file '{full_file_path}' does not exist.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


    # Initialize request argument(s)
    request = dataform_v1beta1.WriteFileRequest(
        workspace=workspace_name,
        contents=blob_data,
        path=rel_file_path
    )

    # Make the request
    client.write_file(request=request)

def update_json_field(file_path, field_name, new_value):
    """Updates a value in a json file dict.

    Args:
        file_path: The path to the json file.
        field_name: The name of the field to update.
        new_value: The new value to update.
    """
    try:
        # Open the JSON file for reading
        with open(file_path, 'r') as file:
            data = json.load(file)  # Load JSON data from the file

        # Update the specified field with the new value
        data[field_name] = new_value

        # Open the same JSON file for writing (this will overwrite the existing file)
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)  # Write the updated JSON data back to the file

        print(f'Updated {field_name} to {new_value} in {file_path}')
    except FileNotFoundError:
        print(f'File not found: {file_path}')
    except json.JSONDecodeError as e:
        print(f'Error decoding JSON in {file_path}: {e}')
    except Exception as e:
        print(f'An error occurred: {e}')

def install_npm_packages(client, workspace_name):
    """Initializes the dataform workspace.

    Installs the npm package dataform/core and creates the 
    package-lock.json file.

    Args:
        client: The path to the json file.
        workspace_name: The name of the workspace to initialize.
    """
    # Initialize request argument(s)
    request = dataform_v1beta1.InstallNpmPackagesRequest(
        workspace=workspace_name,
    )

    # Make the request
    response = client.install_npm_packages(request=request)

    # Handle the response
    print(response)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Creates a dataform project in the specified project_id and dataform_location"
    )
    # The following argument(s) should be provided to run the script.
    parser.add_argument(
        "-p",
        "--project_id",
        type=str,
        required=True,
        help="The Google Cloud Project Id.",
    )

    parser.add_argument(
        "-df",
        "--dataform_location",
        type=str,
        required=True,
        help="The Google Cloud location where the Dataform models will be hosted (example us-central1).",
    )

    parser.add_argument(
        "-ds",
        "--dataset_location",
        type=str,
        required=True,
        help="The Google Cloud Project BQ dataset location (example US).",
    )

    args = parser.parse_args()

    main(args.project_id, args.dataform_location, args.dataset_location)
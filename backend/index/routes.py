import io
from typing import Any

from cosmos import CosmosClient
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile

from .config import settings
from .errors import ClientInitializationError, SettingsError

router = APIRouter()


def get_client() -> CosmosClient:
    try:
        if not hasattr(settings, "COSMOS_APIKEY") or not settings.COSMOS_APIKEY:
            raise SettingsError("COSMOS_APIKEY is missing or empty.")
        print(f"key is `{settings.COSMOS_APIKEY}`, server is `{settings.API_SERVER}`")

        client = CosmosClient(settings.COSMOS_APIKEY, server_url=settings.API_SERVER)
        print(client.status_health_request())

        if not client:
            raise ClientInitializationError("Failed to initialize the client.")
        # print(f"client is {client}")
        return client

    except SettingsError as e:
        print(f"Error: {e}")
        raise

    except ClientInitializationError as e:
        print(f"Error: {e}")
        raise

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise


@router.get("/files/index/list")
async def list_indexes(client: CosmosClient = Depends(get_client)) -> dict[str, Any] | None:
    return client.files_index_list_request()


@router.get("/files/index/details/{index_uuid}")
async def index_details(index_uuid: str, client: CosmosClient = Depends(get_client)) -> dict[str, Any] | None:
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_details_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/create")
async def create_index(
    name: str = Form(...), filesobjects: list[UploadFile] = Form(...), client: CosmosClient = Depends(get_client)
) -> dict[str, Any] | None:
    try:
        print(f"Received name: {name}")
        print(f"Received files: {[file.filename for file in filesobjects]}")

        # Convert the uploaded files to the format expected by the client
        files_data = []
        for file in filesobjects:
            content = await file.read()
            files_data.append(("files", (file.filename, io.BytesIO(content))))

        new_index = client.files_index_create_request(name=name, filesobjects=files_data)

        return new_index

    except Exception as e:
        print(f"Exception : {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/ask")
async def ask_index(
    index_uuid: str,
    question: str,
    output_language: str,
    active_files_hashes: list[str],
    client: CosmosClient = Depends(get_client),
) -> dict[str, Any] | None:
    try:
        print(
            f"Received parameters: index_uuid={index_uuid}, question={question}, output_language={output_language}, active_files_hashes={active_files_hashes}"
        )
        return client.files_index_ask_request(
            index_uuid=index_uuid,
            question=question,
            output_language=output_language,
            active_files_hashes=active_files_hashes,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/embed/{index_uuid}")
async def embed_index(index_uuid: str, client: CosmosClient = Depends(get_client)) -> dict[str, Any] | None:
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_embed_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/add_files")
async def add_files_to_index(
    index_uuid: str, filesobjects: list[UploadFile] = Form(...), client: CosmosClient = Depends(get_client)
) -> dict[str, Any] | None:
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        print(f"Received files: {[file.filename for file in filesobjects]}")

        # Convert the uploaded files to the format expected by the client
        files_data = []
        for file in filesobjects:
            content = await file.read()
            files_data.append(("files", (file.filename, io.BytesIO(content))))

        return client.files_index_add_files_request(index_uuid=index_uuid, filesobjects=files_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/files/index/delete_files")
async def delete_files_from_index(
    index_uuid: str, files_hashes: list[str], client: CosmosClient = Depends(get_client)
) -> dict[str, Any] | None:
    print(f"Received parameters: index_uuid={index_uuid}, files_hashes={files_hashes} type {type(files_hashes)}")
    try:
        print(f"Received parameters: index_uuid={index_uuid}, files_hashes={files_hashes}")
        response = client.files_index_delete_files_request(index_uuid=index_uuid, files_hashes=files_hashes)
        print(f"Response: {response}")
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/files/index/{index_uuid}")
async def delete_index(index_uuid: str, client: CosmosClient = Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_delete_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/restore/{index_uuid}")
async def restore_index(index_uuid: str, client: CosmosClient = Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_restore_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/rename")
async def rename_index(index_uuid: str, name: str, client: CosmosClient = Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}, name={name}")
        return client.files_index_rename_request(index_uuid=index_uuid, name=name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from cosmos import CosmosClient
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from .config import settings
from .errors import ClientInitializationError, SettingsError
from .models import IndexCreateModel

router = APIRouter()


def get_client():
    try:
        if not hasattr(settings, "COSMOS_APIKEY") or not settings.COSMOS_APIKEY:
            raise SettingsError("COSMOS_APIKEY is missing or empty.")
        # print(f"key is {settings.COSMOS_APIKEY}")

        client = CosmosClient(settings.COSMOS_APIKEY)
        # print(client.status_health_request())

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
async def list_indexes(client=Depends(get_client)):
    return client.files_index_list_request()


@router.get("/files/index/details/{index_uuid}")
async def index_details(index_uuid: str, client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_details_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/create")
async def create_index(request: IndexCreateModel, client=Depends(get_client)):
    try:
        payload = request.dict()
        print(f"Received parameters: {payload}")
        return client.files_index_create_request(filepaths=payload["filepaths"], name=payload["name"])
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/ask")
async def ask_index(
    index_uuid: str,
    question: str,
    output_language: str,
    active_files_hashes: list[str],
    client=Depends(get_client),
):
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
async def embed_index(index_uuid: str, client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_embed_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/add_files")
async def add_files_to_index(index_uuid: str, filepaths: list[str], client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}, filepaths={filepaths}")
        return client.files_index_add_files_request(index_uuid=index_uuid, filepaths=filepaths)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/files/index/delete_files")
async def delete_files_from_index(index_uuid: str, files_hashes: list[str], client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}, files_hashes={files_hashes}")
        return client.files_index_delete_files_request(index_uuid=index_uuid, files_hashes=files_hashes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/files/index/{index_uuid}")
async def delete_index(index_uuid: str, client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_delete_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/restore/{index_uuid}")
async def restore_index(index_uuid: str, client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_restore_request(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/rename")
async def rename_index(index_uuid: str, name: str, client=Depends(get_client)):
    try:
        print(f"Received parameters: index_uuid={index_uuid}, name={name}")
        return client.files_index_rename_request(index_uuid=index_uuid, name=name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

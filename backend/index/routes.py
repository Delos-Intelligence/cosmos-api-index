from io import BytesIO
from typing import IO, Any

from cosmos import CosmosClient
from fastapi import APIRouter, Form, HTTPException, UploadFile

from .config import settings
from .errors import ClientInitializationError, SettingsError
from .utils import logger

router = APIRouter()


def get_client() -> CosmosClient:
    try:
        if not hasattr(settings, "COSMOS_API_KEY") or not settings.COSMOS_API_KEY:
            raise SettingsError("COSMOS_API_KEY is missing or empty.")
        logger.debug(f"Initializing client: key is `{settings.COSMOS_API_KEY}`, server is `{settings.API_SERVER}`")

        client = CosmosClient(settings.COSMOS_API_KEY, server_url=settings.API_SERVER)
        logger.debug(f"Test API health status: {client.status_health()}")

        if not client:
            raise ClientInitializationError("Failed to initialize the client.")
        return client

    except SettingsError as e:
        logger.debug(f"Error: {e}")
        raise

    except ClientInitializationError as e:
        logger.debug(f"Error: {e}")
        raise

    except Exception as e:
        logger.debug(f"An unexpected error occurred: {e}")
        raise


client = get_client()


@router.get("/test")
async def test() -> dict[str, Any] | None:
    try:
        return client.llm_chat(text="Hello, world!", model="gpt-4o", response_format='{"type":"json_format"}')
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/index/list")
async def list_indexes() -> dict[str, Any] | None:
    try:
        return client.files_index_list()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/index/{index_uuid}/details")
async def index_details(index_uuid: str) -> dict[str, Any] | None:
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_details(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/create")
async def create_index(name: str = Form(...), filesobjects: list[UploadFile] = Form(...)) -> dict[str, Any] | None:
    try:
        logger.debug(f"Received name: {name}")
        logger.debug(f"Received files: {[file.filename or '' for file in filesobjects]}")

        # Convert the uploaded files to the format expected by the client
        files_data: list[tuple[str, tuple[str, IO[bytes]]]] = []
        for file in filesobjects:
            content = await file.read()
            files_data.append(("files", (file.filename or "", BytesIO(content))))

        new_index = client.files_index_create(name=name, filesobjects=files_data)
        return new_index

    except Exception as e:
        logger.debug(f"Exception : {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/{index_uuid}/ask")
async def ask_index(
    index_uuid: str,
    question: str,
    output_language: str,
    active_files: list[str] | str = "all",
) -> dict[str, Any] | None:
    try:
        logger.debug(
            f"Received parameters: index_uuid={index_uuid}, question={question}, output_language={output_language}, "
            f"active_files={active_files}"
        )
        return client.files_index_ask(
            index_uuid=index_uuid,
            question=question,
            output_language=output_language,
            active_files=active_files,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/{index_uuid}/embed")
async def embed_index(index_uuid: str) -> dict[str, Any] | None:
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_embed(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/files/index/{index_uuid}/add_files")
async def add_files_to_index(index_uuid: str, filesobjects: list[UploadFile] = Form(...)) -> dict[str, Any] | None:
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}")
        logger.debug(f"Received files: {[file.filename for file in filesobjects]}")

        # Convert the uploaded files to the format expected by the client
        files_data: list[tuple[str, tuple[str, IO[bytes]]]] = []
        for file in filesobjects:
            content = await file.read()
            files_data.append(("files", (file.filename or "", BytesIO(content))))

        return client.files_index_files_add(index_uuid=index_uuid, filesobjects=files_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/files/index/{index_uuid}/delete_files")
async def delete_files_from_index(index_uuid: str, files_hashes: list[str]) -> dict[str, Any] | None:
    logger.debug(f"Received parameters: index_uuid={index_uuid}, files_hashes={files_hashes} type {type(files_hashes)}")
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}, files_hashes={files_hashes}")
        response = client.files_index_files_delete(index_uuid=index_uuid, files_hashes=files_hashes)
        logger.debug(f"Response: {response}")
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/files/index/{index_uuid}/delete")
async def delete_index(index_uuid: str):
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_delete(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/{index_uuid}/restore")
async def restore_index(index_uuid: str):
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}")
        return client.files_index_restore(index_uuid=index_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/files/index/{index_uuid}/rename")
async def rename_index(index_uuid: str, name: str):
    try:
        logger.debug(f"Received parameters: index_uuid={index_uuid}, name={name}")
        return client.files_index_rename(index_uuid=index_uuid, name=name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

"""
Modelos de dados para o backend do Papo Social.

Este pacote contém modelos Pydantic para validação e serialização de dados,
incluindo modelos para residentes, solicitações e outros objetos do sistema.
"""

from .resident import ResidentModel
from .request import RequestModel
from .bson_types import PydanticObjectId

__all__ = ["ResidentModel", "RequestModel", "PydanticObjectId"]

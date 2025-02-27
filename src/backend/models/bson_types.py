from typing import Any
from bson import ObjectId
from pydantic_core import CoreSchema, core_schema
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler, field_serializer

class PydanticObjectId(ObjectId):
    """Tipo personalizado para lidar com ObjectIds do MongoDB no Pydantic v2."""
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> CoreSchema:
        """Define como validar e serializar ObjectIds."""
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(  # Corrigido: nome correto do método
                lambda x: str(x) if isinstance(x, ObjectId) else x
            ),
        )
    
    @classmethod
    def validate(cls, value: Any) -> ObjectId:
        """Converte uma string em ObjectId."""
        if isinstance(value, ObjectId):
            return value
        if isinstance(value, str):
            return ObjectId(value)
        raise ValueError("Invalid ObjectId")

    @field_serializer
    def serialize_object_id(self) -> str:
        """Serializa ObjectId para string."""
        return str(self)

# Gaia-X Compliance Widget

Project to incorporate the Gaia-X compliance widget to obtain participant credentials and service offerings.


## Usage

Description of how to use this project if required. (For libraries)

## Run the project

Description of how to run this project. (For apps)

## Env vars

Multiple tables with all the available env vars and their use. Also add the default value if exists. (For libraries and apps)

|Variable Name| Variable Value|
|-----|-------|
|Token | as9d7f6g98a7sdf8as97df|

## Integracion via iframe (PostMessage)

El widget se puede embeber en un iframe. Al completar el flujo de compliance exitosamente, envia los resultados al parent via `postMessage`.

### Lo que devuelve el widget

```json
{
  "files": [
    { "filename": "legalParticipant.json", "content_in_base64": "..." },
    { "filename": "gx-terms-and-cs.json", "content_in_base64": "..." },
    { "filename": "legalRegistrationNumber.json", "content_in_base64": "..." },
    { "filename": "complianceCredential.json", "content_in_base64": "..." }
  ]
}
```

| Archivo | Contenido |
|---------|-----------|
| `legalParticipant.json` | VC del participante legal firmada |
| `gx-terms-and-cs.json` | VC de terminos y condiciones firmada |
| `legalRegistrationNumber.json` | VC del numero de registro legal (firmada por el Notary de Gaia-X) |
| `complianceCredential.json` | Compliance Credential emitido por Gaia-X (solo si la validacion fue exitosa) |

Solo se envia si el compliance es exitoso (201). Si falla, se muestra el error en la UI sin enviar postMessage.

## Technical procedures

Description of procedures related with this project (For apps)


## Changelog

Link to the `CHANGELOG.md` file generated following this [good practices](https://keepachangelog.com/en/1.0.0/).

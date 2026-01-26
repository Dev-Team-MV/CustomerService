# Configuración de Google Cloud Storage

## Variables de Entorno Necesarias

Agrega las siguientes variables a tu archivo `.env`:

```env
# Google Cloud Storage Configuration
GCS_PROJECT_ID=tu-project-id
GCS_BUCKET_NAME=customer-service-7cc

# Opción 1: Ruta al archivo JSON de credenciales (recomendado para producción)
GCS_KEYFILE_PATH=config/gcs-keyfile.json

# Opción 2: Credenciales como JSON string (para desarrollo)
# GCS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Configuración de acceso público
GCS_MAKE_PUBLIC=false  # true para URLs públicas, false para signed URLs
```

## Obtener Credenciales de Google Cloud

### Opción 1: Crear Service Account y descargar JSON

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **IAM & Admin** > **Service Accounts**
4. Crea un nuevo Service Account o usa uno existente
5. Clic en el Service Account > **Keys** > **Add Key** > **Create new key**
6. Selecciona **JSON** y descarga el archivo
7. Guarda el archivo en `config/gcs-keyfile.json` (o la ruta que especifiques en `GCS_KEYFILE_PATH`)
8. Asegúrate de que el Service Account tenga permisos:
   - **Storage Object Admin** o **Storage Admin** para el bucket

### Opción 2: Usar Application Default Credentials (ADC)

Si estás ejecutando en Google Cloud (Cloud Run, App Engine, Compute Engine), puedes usar ADC automáticamente. Solo necesitas:

```env
GCS_PROJECT_ID=tu-project-id
GCS_BUCKET_NAME=customer-service-7cc
```

## Configurar Permisos del Bucket

### Para URLs Públicas (GCS_MAKE_PUBLIC=true)

1. Ve a Google Cloud Console > **Cloud Storage** > **Buckets**
2. Selecciona el bucket `customer-service-7cc`
3. Ve a la pestaña **Permissions**
4. Clic en **Grant Access**
5. Agrega:
   - **Principal**: `allUsers`
   - **Role**: `Storage Object Viewer`
6. Guarda los cambios

**Nota**: Esto hace que todos los objetos subidos sean públicos. Usa con precaución.

### Para Signed URLs (GCS_MAKE_PUBLIC=false) - Recomendado

No necesitas configurar permisos públicos. Los objetos permanecen privados y se generan URLs firmadas con expiración.

## Endpoints Disponibles

### Subir una imagen
```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  image: <file>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileName": "images/2025/01/abc123.jpg",
    "url": "https://storage.googleapis.com/...",
    "publicUrl": "https://storage.googleapis.com/...",
    "signedUrl": null,
    "size": 123456,
    "mimeType": "image/jpeg"
  }
}
```

### Subir múltiples imágenes
```
POST /api/upload/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  images: <file1>, <file2>, ...
```

### Eliminar una imagen (Admin only)
```
DELETE /api/upload/image/:fileName
Authorization: Bearer <admin_token>
```

## Estructura de Archivos

Las imágenes se organizan automáticamente por fecha:
```
bucket/
  images/
    2025/
      01/
        abc123.jpg
        def456.png
```

## Límites

- Tamaño máximo por archivo: 10MB
- Formatos permitidos: jpeg, jpg, png, gif, webp
- Múltiples archivos: hasta 10 a la vez

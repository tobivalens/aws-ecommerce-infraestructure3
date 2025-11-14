#!/bin/bash
set -e

echo "Iniciando despliegue completo del proyecto AWS..."

# -----------------------------
# 1. Variables
# -----------------------------
STACK_NAME="bookstore-main"
TEMPLATE_FILE="bookstore-corrected.yaml"
KEY_PAIR_NAME="bookstore-keypair"

BUCKET="bookstore-artifacts-$(date +%s)"

REPO_URL="https://raw.githubusercontent.com/tobivalens/aws-ecommerce-infraestructure3/main/infraestructe"

# -----------------------------
# 2. Descargar template desde GitHub automáticamente
# -----------------------------
echo "📥 Descargando plantilla desde GitHub..."
curl -L "$REPO_URL/$TEMPLATE_FILE" -o "$TEMPLATE_FILE"

echo "✔ Plantilla descargada"

# -----------------------------
# 3. Crear Key Pair automáticamente
# -----------------------------
echo "🔑 Creando KeyPair..."
aws ec2 create-key-pair \
  --key-name "$KEY_PAIR_NAME" \
  --query "KeyMaterial" --output text > "${KEY_PAIR_NAME}.pem"

chmod 400 "${KEY_PAIR_NAME}.pem"
echo "✔ KeyPair creado y guardado como ${KEY_PAIR_NAME}.pem"

# -----------------------------
# 4. Crear bucket único
# -----------------------------
echo "📦 Creando bucket S3: $BUCKET"
aws s3 mb "s3://$BUCKET"
echo "✔ Bucket creado"

# -----------------------------
# 5. Despliegue CloudFormation
# -----------------------------
echo "🚀 Desplegando CloudFormation..."

aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM \
  --parameter-overrides \
      ProjectName=bookstore \
      RepoUrl="https://github.com/tobivalens/aws-ecommerce-infraestructure3.git" \
      RepoBranch=main \
      DBPassword="Book1234!" \
      KeyName="$KEY_PAIR_NAME" \
      ExistingBucketName="" \
  --no-fail-on-empty-changeset

echo "🎉 DEPLOY COMPLETADO"
echo "✔ Revisa los outputs del stack:"
echo "aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs'"

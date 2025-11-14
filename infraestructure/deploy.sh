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

# -----------------------------
# 2. Verificar que el template exista localmente
# -----------------------------
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "No se encontró el archivo $TEMPLATE_FILE en $(pwd)"
  echo "Asegúrate de estar en la carpeta infraestructure con el YAML."
  exit 1
fi

echo "Usando plantilla local: $TEMPLATE_FILE"

# -----------------------------
# 3. Key Pair (.pem) – solo si hace falta
# -----------------------------
echo "🔑 Verificando KeyPair..."

# Si ya existe el .pem, no lo tocamos
if [ -f "$HOME/$KEY_PAIR_NAME.pem" ]; then
  echo "Ya existe $HOME/$KEY_PAIR_NAME.pem, no se vuelve a crear."
else
  echo "🆕 Creando KeyPair en AWS y guardando .pem..."

  aws ec2 create-key-pair \
    --key-name "$KEY_PAIR_NAME" \
    --query 'KeyMaterial' \
    --output text > "$HOME/$KEY_PAIR_NAME.pem"

  chmod 400 "$HOME/$KEY_PAIR_NAME.pem"
  echo "✔ KeyPair creada y guardada en $HOME/$KEY_PAIR_NAME.pem"
fi

# -----------------------------
# 4. Crear bucket único
# -----------------------------
echo " Creando bucket S3: $BUCKET"
aws s3 mb "s3://$BUCKET"
echo "✔ Bucket creado"

# -----------------------------
# 5. Despliegue CloudFormation
# -----------------------------
echo "Desplegando CloudFormation..."

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
echo "✔ Revisa los outputs del stack con:"
echo "aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs'"



echo "🔍 Obteniendo DNS del Application Load Balancer..."

ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='AlbDNS'].OutputValue" \
  --output text)

if [ "$ALB_DNS" == "None" ] || [ -z "$ALB_DNS" ]; then
  echo "⚠ No se encontró el output AlbDNS. Revisa el stack en AWS."
else
  echo ""
  echo " Tu aplicación está desplegada correctamente."
  echo " Accede aquí:"
  echo " http://$ALB_DNS"
  echo ""
fi
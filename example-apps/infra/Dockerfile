# Base our image on the terraform image
FROM hashicorp/terraform:1.0.2

# Install bash
RUN apk add bash

# Set our work directory to /tf
WORKDIR /tf

# Copy the infra folder from our repo into the current directory
# Notice how the copy is relative to the repository root, as opposed to the Dockerfile location.
COPY . .

# Set our entrypoint to run the execute-terraform.sh shell script when the built image is executed
#ENTRYPOINT bash ./scripts/execute-terraform.sh /tf "backend/${ENVIRONMENT_NAME}.backend.hcl" "env/$ENVIRONMENT_NAME.tfvars" "false"
ENTRYPOINT terraform --version

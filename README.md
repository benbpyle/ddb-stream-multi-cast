# Serverless FHIR Patient Converter

Purpose: Working example of using DynamoDB Streams, EventBridge Pipes and an Enrichment Lambda to convert a make-believe patient into a FHIR Patient.

## Getting Started

### Deploying

First off, install [Node.js](https://nodejs.org/en)

```bash
# install AWS CDK
npm install -g aws-cdk
# clone the repository
cd serverless-fhir-patient-converter
npm install
```

Once dependencies have been installed, you are ready to run CDK

```bash
cdk deploy
```

## Destroying

Simply run:

```bash
cdk destroy
```

## Implementation

You'll want to create a base patient record to work with. This one is a good sample.

For a further and in-depth review of how to use this repository and what it supports, head on over the [Blog Article]()

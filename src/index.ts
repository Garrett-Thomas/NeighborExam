import { APIGatewayProxyEvent } from 'aws-lambda';

/*
Assume that we want to find a place for the largest car first.
*/

export const handler = async (event: APIGatewayProxyEvent) => {

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};


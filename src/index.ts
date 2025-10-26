import { APIGatewayProxyEvent } from 'aws-lambda';
import { findLocations } from './findLocation';
import { type CarData } from './findLocation';
import listings from "./listings.json";
/*
Assume that we want to find a place for the largest car first.
*/

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.body == null) {

    const response = {
      statusCode: 400,
      body: JSON.stringify('Bad request')
    };

    return response;
  }

  try {

    const cars = JSON.parse(event.body) as Array<CarData>;

    const response = {
      statusCode: 200,
      body: JSON.stringify(findLocations(cars, listings))
    }

    return response;
  }
  catch (e) {
    const response = {
      statusCode: 500,
      body: JSON.stringify("There was an error processing your request")
    }
  }

};


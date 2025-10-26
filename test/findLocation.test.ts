import { describe, it, expect } from "vitest";
import { findLocations } from "../src/findLocation";
import type { CarData, LocationData, LocationDataReturn } from "../src/findLocation";


/*
export interface LocationData {

    id: string,
    length: number,
    width: number,
    location_id: string,
    price_in_cents: number

}
*/

describe('Basic Find Location Tests', () => {

    it("Should return the lower cost between location id's", () => {

        const data: Array<CarData> = [{
            length: 20,
            quantity: 1
        }];

        const locationData: Array<LocationData> = [
            {
                id: "12",
                length: 10,
                width: 100,
                location_id: "1",
                price_in_cents: 100

            },
            {
                id: "11",
                length: 10,
                width: 100,
                location_id: "1",
                price_in_cents: 10

            }
        ];

        const result = findLocations(data, locationData);

        const expected: Array<LocationDataReturn> = [
            {
                location_id: "1",
                listing_ids: ["11"],
                total_price_in_cents: 10
            }
        ]

        expect(result).toStrictEqual(expected);

    });

    it("Should return the cheapest combination", () => {

        const data: Array<CarData> = [
            {
                length: 20,
                quantity: 1
            },
            {
                length: 10,
                quantity: 1
            },
            {
                length: 30,
                quantity: 1
            }
        ];

        const locationData: Array<LocationData> = [
            {
                id: "11",
                length: 10,
                width: 20,
                location_id: "1",
                price_in_cents: 10

            },
            {
                id: "12",
                length: 10,
                width: 10,
                location_id: "1",
                price_in_cents: 10

            },

            {
                id: "13",
                length: 10,
                width: 10,
                location_id: "1",
                price_in_cents: 100

            },

            {
                id: "14",
                length: 10,
                width: 30,
                location_id: "1",
                price_in_cents: 10

            }
        ];

        const result = findLocations(data, locationData);

        const expected: Array<LocationDataReturn> = [
            {
                location_id: "1",
                listing_ids: ["11", "12", "14"],
                total_price_in_cents: 30
            }
        ]

        expect(result).toStrictEqual(expected);

    });

});

import { Combination} from "ts-combinatorics";

export interface CarData {
    length: number,
    quantity: number
}

export interface LocationData {

    id: string,
    length: number,
    width: number,
    location_id: string,
    price_in_cents: number

}
export interface LocationDataReturn {

    location_id: string,
    listing_ids: Array<string>,
    total_price_in_cents: number

}
const CAR_WIDTH = 1;

export const canPackRecursive = (vehicles: number[], vehicleIndex: number, spaces: number[][]): boolean => {
    // Base case: If we have successfully placed all vehicles, we are done.
    if (vehicleIndex === vehicles.length) {
        return true;
    }

    const vehicleLength = vehicles[vehicleIndex];

    // Iterate through each listing (i) and each lane within that listing (j)
    for (let i = 0; i < spaces.length; i++) {
        for (let j = 0; j < spaces[i].length; j++) {
            // If the current vehicle fits in the current lane
            if (spaces[i][j] >= vehicleLength) {
                // Place the vehicle and recurse
                spaces[i][j] -= vehicleLength;

                // If the rest of the vehicles can be placed, we've found a solution
                if (canPackRecursive(vehicles, vehicleIndex + 1, spaces)) {
                    return true;
                }

                // Backtrack: Undo the placement to explore other possibilities
                spaces[i][j] += vehicleLength;
            }
        }
    }

    // If we've tried all lanes and couldn't place the vehicle, this path fails
    return false;
}

const checkFit = (vehicles: number[], listings: LocationData[]): boolean => {
    const numListings = listings.length;

    // We must check every possible combination of orientations for the given listings.
    // E.g., for 2 listings, we check [orient1, orient1], [orient1, orient2], [orient2, orient1], [orient2, orient2]
    // This can be modeled by iterating from 0 to 2^numListings - 1.
    for (let i = 0; i < (1 << numListings); i++) {
        const spaces: number[][] = [];
        for (let j = 0; j < numListings; j++) {
            const listing = listings[j];

            // Use the j-th bit of i to determine the orientation for the j-th listing
            const isRotated = ((i >> j) & 1) === 1;

            const length = listing.length;
            const width = listing.width;

            // In the "normal" orientation, we have `width/10` lanes of `length`.
            // When "rotated", we have `length/10` lanes of `width`.
            const numLanes = isRotated ? Math.floor(length / 10) : Math.floor(width / 10);
            const laneLength = isRotated ? width : length;

            spaces.push(Array(numLanes).fill(laneLength));
        }

        // With this specific set of orientations, try to pack the vehicles.
        // We pass a deep copy of spaces because the recursive function modifies it.
        const spacesCopy = JSON.parse(JSON.stringify(spaces));
        if (canPackRecursive(vehicles, 0, spacesCopy)) {
            return true; // A valid packing was found
        }
    }

    // If we've tried all orientation combinations and none worked, it's not a fit.
    return false;
}

/* 
Procedure:
1. Put all car lengths in an array
2. Group all listings by their ids
3. Iterate through all listings by location id
4. Generate all combinations of those listings.
5. Check to see if the cars can fit inside those combinations. If they can,
return after all combinations of same length are checked
*/
export const findLocations = (cars: Array < CarData > , locationData: Array < LocationData > ): Array < LocationDataReturn > => {

    // 1. Pre-process the input vehicles into a flat array of lengths.
    // Sorting them descending is a common heuristic for bin packing that can lead to faster solutions.
    const vehicles: number[] = [];
    for (const car of cars) {
        for (let i = 0; i < car.quantity; i++) {
            vehicles.push(car.length);
        }
    }
    vehicles.sort((a, b) => b - a);

    // 2. Group all listings by their location_id for easier processing.
    const locationsMap = new Map < string, Array < LocationData >> ();
    for (const listing of locationData) {
        if (!locationsMap.has(listing.location_id)) {
            locationsMap.set(listing.location_id, []);
        }
        locationsMap.get(listing.location_id) !.push(listing);
    }

    const finalResults: LocationDataReturn[] = [];

    // 3. Iterate through each location.
    for (const [location_id, listings] of locationsMap) {
        let cheapestCombinationForLocation: LocationDataReturn | null = null;

        // 4. Generate all possible non-empty combinations of listings for the current location.
        // We check combinations in increasing order of size (1 listing, then 2, etc.).
        for (let i = 1; i <= listings.length; i++) {
            const listingCombinations = new Combination(listings, i);

            for (const combo of listingCombinations) {
                // 5. For each combination, check if it can fit all the vehicles.
                if (checkFit(vehicles, combo)) {
                    // This combination works. Calculate its total price.
                    const totalPrice = combo.reduce((sum, listing) => sum + listing.price_in_cents, 0);

                    // If we haven't found a solution for this location yet, or if this one is cheaper, store it.
                    if (cheapestCombinationForLocation === null || totalPrice < cheapestCombinationForLocation.total_price_in_cents) {
                        cheapestCombinationForLocation = {
                            location_id: location_id,
                            listing_ids: combo.map(l => l.id).sort(),
                            total_price_in_cents: totalPrice
                        };
                    }
                }
            }
            // Optimization: If we have found a working combination of size `i`,
            // we don't need to check any larger combinations because they will necessarily be more expensive
            // (assuming prices are non-negative). We can move to the next location.
            if (cheapestCombinationForLocation) {
                break;
            }
        }

        if (cheapestCombinationForLocation) {
            finalResults.push(cheapestCombinationForLocation);
        }
    }

    // 6. Sort the final results by total price in ascending order before returning.
    return finalResults.sort((a, b) => a.total_price_in_cents - b.total_price_in_cents);
}


// Cars will always be placed in the same orientation, down the cols;
// export const placeCar = (space: Array<Array<number>>, carWidth: number): boolean => {

//     /* Car-> 0
//     x x x    0
//     x x x
//     x x x
//     x x x
//     */
//     // Just want to iterate through each row
//     const numCols = space.length;
//     const numRows = space[0].length;
//     for (let col = 0; col < numCols; col++) {
//         for (let row = 0; row < numRows; row++) {
//             if (space[col][row] === 0) {
//                 if (row + carWidth > numRows) {
//                     break;
//                 }
//                 if (!space[col].includes(1, row)) {
//                     for (let idx = row; idx < row + carWidth; idx++) {
//                         space[col][idx] = 1;
//                     }
//                     return true;
//                 }
//             }
//         }

//     }



//     return false;
// }


// /*
// I want to find all permutations of the cars w/ listings of the same location ID's
// Then I want to return the cheapest combination

//  */
// export const findLocations = (cars: Array<CarData>, locationData: Array<LocationData>): Array<LocationDataReturn> => {

//     // want a map that goes from the location id to listings    
//     const locID = new Map<string, Array<LocationData>>();

//     const sortedCars = new Array<number>();

//     for (const car of cars) {
//         for (let i = 0; i < car.quantity; i++) {
//             sortedCars.push(Math.trunc(car.length / 10));
//         }
//     }

//     sortedCars.sort((a, b) => a - b);

//     for (const listing of locationData) {
//         if (locID.get(listing.location_id) === undefined) {
//             locID.set(listing.location_id, new Array<LocationData>());
//         }
//         listing.length = Math.trunc(listing.length / 10);
//         listing.width = Math.trunc(listing.width / 10);
//         const arr = locID.get(listing.location_id);
//         arr?.push(listing);
//     }

//     const allCarPerms = [...new Permutation(sortedCars, sortedCars.length)];
//     const res = new Array<LocationDataReturn>();
//     // Want to iterate through all of the listings, checking to see how many cars I can fit onto each listing in both orientations
//     for (const [location_id, listings] of locID) {

//         listings.sort((a, b) => a.price_in_cents - b.price_in_cents);
//         let lowest = { listings_ids: new Array<string>, total_price: -1 };
//         for (const carPerm of allCarPerms) {

//             const currCars = Array.from(carPerm);

//             const listingData = new Array();

//             let price = 0;
//             for (const listing of listings) {
//                 const firstOrientation = new Array(listing.width).fill(0).map(() => Array(listing.length).fill(0));
//                 const secondOrientation = new Array(listing.length).fill(0).map(() => Array(listing.width).fill(0));

//                 let didAddCarFirst = true;
//                 let didAddCarSecond = true;

//                 while (currCars.length > 0) {

//                     const car = currCars[currCars.length - 1] as number;

//                     // Note that my orientation is not consistent between cars
//                     if (didAddCarFirst) {
//                         didAddCarFirst = placeCar(firstOrientation, car);
//                     }
//                     if (didAddCarSecond) {
//                         didAddCarSecond = placeCar(secondOrientation, car);
//                     }

//                     if (!didAddCarFirst && !didAddCarSecond) {

//                         break;
//                     }

//                     currCars.pop();
//                 }

//                 if (didAddCarFirst || didAddCarSecond) {
//                     listingData.push(listing.id);
//                     price += listing.price_in_cents;
//                 }
//                 if (currCars.length == 0) {
//                     if (lowest.total_price == -1 || lowest.total_price > price) {
//                         lowest = { listings_ids: listingData, total_price: price }
//                     }
//                 }
//             }



//         }
//         if (lowest.total_price != -1) {
//             res.push({
//                 location_id: location_id,
//                 listing_ids: lowest.listings_ids,
//                 total_price_in_cents: lowest.total_price
//             })
//         }

//     }
//     return res;
// }

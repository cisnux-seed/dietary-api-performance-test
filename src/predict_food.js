import http from "k6/http";
import {check} from "k6";

const foodPictures = [];
const fileNames = [];
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIzY2IwYTg0OC03NDRkLTQ1YjYtYjlhMy00OTRmMWQ5MjBhZmQiLCJuYmYiOjE3MTg1Mzk2ODMsImV4cCI6MTcxODc5ODg4MywiaWF0IjoxNzE4NTM5NjgzfQ.NK1BdTYgI6dVyQ0FQyr3DWjRPZ8z2xe_f2Fp9gj6DhQ';

for (let i = 0; i < 9; i++) {
    const fileName = `food_picture${i + 1}.jpeg`;
    const foodPicture = open(`../fixtures/${fileName}`, 'b');
    fileNames.push(fileName);
    foodPictures.push(foodPicture);
}

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.10'], // http errors should be less than 10%
    },
    scenarios: {
        predictBy10VuConcurrently: {
            exec: 'predictFood',
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 100,
        },
        // predictBy15VuConcurrently: {
        //     exec: 'predictFood',
        //     executor: 'per-vu-iterations',
        //     vus: 15,
        //     iterations: 50,
        // },
    }
};

export function predictFood() {
    const foodPicture = (__ITER % 9) + 1

    const predictBodyRequest = {
        'imgFile': http.file(foodPictures[foodPicture - 1], fileNames[foodPicture - 1])
    }
    const predictResponse = http.post('https://api.dietary.cloud/food/predict', predictBodyRequest, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    });
    console.log(predictResponse.status)
    check(
        predictResponse,
        {
            'predict response status code must be 200 (OK)': (response) => response.status === 200,
            'predict response body must have foods': (response) => response.json().data.foods != null,
        }
    )
}
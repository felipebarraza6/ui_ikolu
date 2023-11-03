

import axios from 'axios'

const BASE_URL = 'https://api.tago.io/data'

// BRAMADERO 1333aa6c-6a3f-46d0-ab94-6359c6b0cdf3
const token_novus = JSON.parse(localStorage.getItem('selected_profile'))


export const GET = async (endpoint, token) =>{
    const request = await axios.get(endpoint, {
        baseURL: BASE_URL,
        headers: {
            Authorization: token
        }
    })
    return request
}
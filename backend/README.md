# WhatToDo API

## Building and Running the API

1. Create a `.env` file in the root directory of the project and add the following environment variables:
    ```env
    APP_PORT=3000
    ```

2. Build and start the service:
    ```bash
    docker compose build --no-cache && docker compose up
    ```

The API will be available at `http://localhost:3000`.

## API Endpoints

- GET `/health`: Check the health status of the API.
- POST `/events/recommendations`: Generate event recommendations based on the provided input.
### Example Request Body for Event Recommendations
```json
{
    "city": "San Francisco",
    "interests": "live music, food",
    "budget": 50,
    "date_range": "2026-03-15 to 2026-03-20"
}
```

Response:
```json
[
    {
        "name": "Club Mandalay: Jazz & Ancestral Philippine Music at the I-Hotel",
        "description": "Live jazz and pre-colonial Philippine music & dance at the I-Hotel—an afternoon of belonging, memory, and shared community.",
        "location": "International Hotel Manilatown Center, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 0.0,
        "duration_minutes": 180,
        "indoor": true,
        "tags": [
            "free",
            "jazz",
            "cultural",
            "live-music",
            "donations-appreciated"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/club-mandalay-jazz-ancestral-philippine-music-at-the-i-hotel-tickets-1983026462531",
        "start_time": "2026-03-14T14:00:00",
        "end_time": "2026-03-14T17:00:00",
        "verified": false
    },
    {
        "name": "ALO - Fillmore Meet & Greet",
        "description": "A limited number of guests will get to have an exclusive photo with the band and a gift package that includes a VIP laminate, sticker pack, and a 2026 Tour d'Amour heart pin.",
        "location": "Fillmore Street, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 35.0,
        "duration_minutes": 60,
        "indoor": true,
        "tags": [
            "live-music",
            "meet-and-greet",
            "vip",
            "check-pricing"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/alo-fillmore-meet-greet-tickets-1984635468110",
        "start_time": "2026-03-14T18:30:00",
        "end_time": "2026-03-14T19:30:00",
        "verified": false
    },
    {
        "name": "San Francisco Rooftop Holi Music Festival 2026",
        "description": "Experience San Francisco's biggest and most vibrant Holi Music Festival with high-energy music, vibrant color throws, delicious food, and an electric party atmosphere.",
        "location": "SVN West, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 45.0,
        "duration_minutes": 300,
        "indoor": false,
        "tags": [
            "music-festival",
            "food",
            "cultural",
            "holi",
            "check-pricing"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/san-francisco-rooftop-holi-music-festival-2026-march-21-tickets-1982602049099",
        "start_time": "2026-03-21T12:00:00",
        "end_time": "2026-03-21T17:00:00",
        "verified": false
    },
    {
        "name": "San Francisco Chocolate Salon and Festival 2026",
        "description": "The original and premier artisan chocolate festival on the West Coast featuring chocolate tasting, demonstrations, and chef talks.",
        "location": "San Francisco County Fair Building / Hall of Flowers, 1199 9th Avenue at Lincoln Way, San Francisco, CA",
        "category": "food",
        "estimated_cost": 25.0,
        "duration_minutes": 360,
        "indoor": true,
        "tags": [
            "food",
            "chocolate",
            "tasting",
            "artisan",
            "20th-anniversary"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/san-francisco-chocolate-salon-and-festival-2026-tickets-1976663690308",
        "start_time": "2026-03-28T11:00:00",
        "end_time": "2026-03-28T17:00:00",
        "verified": false
    }
]
```
### Start and End Time Filtering
The API now supports filtering events based on preferred start and end times of the day. You can specify these preferences in the request body using the `day_start_time` and `day_end_time` fields. For example:
```json
{
    "city": "San Francisco",
    "interests": "live music, food",
    "budget": 50,
    "date_range": "2026-03-15 to 2026-03-20",
    "day_start_time": "4PM",
    "day_end_time": "9PM"
}
```
Response
```json
[
    {
        "name": "Club Mandalay: Jazz & Ancestral Philippine Music at the I-Hotel",
        "description": "Live jazz and pre-colonial Philippine music & dance at the I-Hotel—an afternoon of belonging, memory, and shared community.",
        "location": "International Hotel Manilatown Center, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 0.0,
        "duration_minutes": 60,
        "indoor": true,
        "tags": [
            "free",
            "jazz",
            "cultural",
            "live-music",
            "community"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/club-mandalay-jazz-ancestral-philippine-music-at-the-i-hotel-tickets-1983026462531",
        "start_time": "2026-03-14T16:00:00",
        "end_time": "2026-03-14T17:00:00",
        "verified": false
    },
    {
        "name": "Nine Inch Nails",
        "description": "Major arena concert featuring the iconic industrial rock band Nine Inch Nails at Chase Center.",
        "location": "Chase Center, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 45.0,
        "duration_minutes": 60,
        "indoor": true,
        "tags": [
            "live-music",
            "rock",
            "industrial",
            "arena-show"
        ],
        "source": "Concert Listing",
        "event_url": "https://www.amsires.com/new-year-new-events-top-san-francisco-events-to-start-the-year",
        "start_time": "2026-03-15T20:00:00",
        "end_time": "2026-03-15T21:00:00",
        "verified": false
    },
    {
        "name": "Castro Night Market",
        "description": "The Castro Night Market returns for season two, taking over two blocks of 18th Street and turning them into a pedestrian-friendly night market filled with food, music.",
        "location": "18th Street, Castro District, San Francisco, CA",
        "category": "food",
        "estimated_cost": 0.0,
        "duration_minutes": 180,
        "indoor": false,
        "tags": [
            "free",
            "food",
            "night-market",
            "music",
            "street-fair"
        ],
        "source": "SF FunCheap",
        "event_url": "https://sf.funcheap.com/city-guide/san-francisco-march-festivals-street-fairs/",
        "start_time": "2026-03-20T18:00:00",
        "end_time": "2026-03-20T21:00:00",
        "verified": false
    },
    {
        "name": "San Francisco Rooftop Holi Music Festival 2026",
        "description": "Experience San Francisco's biggest and most vibrant Holi Music Festival with live DJ performances, vibrant color throws, delicious food, and an electric party atmosphere.",
        "location": "SVN West, San Francisco, CA",
        "category": "entertainment",
        "estimated_cost": 35.0,
        "duration_minutes": 60,
        "indoor": false,
        "tags": [
            "music-festival",
            "food",
            "cultural",
            "outdoor",
            "color-festival"
        ],
        "source": "Eventbrite",
        "event_url": "https://www.eventbrite.com/e/san-francisco-rooftop-holi-music-festival-2026-march-21-tickets-1982602049099",
        "start_time": "2026-03-21T16:00:00",
        "end_time": "2026-03-21T17:00:00",
        "verified": false
    },
    {
        "name": "San Francisco Chocolate Salon and Festival 2026",
        "description": "Chocolate lovers will swoon over this annual SF food event featuring a variety of top chocolatiers and culinary artists with tastings and demonstrations.",
        "location": "San Francisco County Fair Building, San Francisco, CA",
        "category": "food",
        "estimated_cost": 25.0,
        "duration_minutes": 0,
        "indoor": true,
        "tags": [
            "food",
            "chocolate",
            "tasting",
            "culinary",
            "festival"
        ],
        "source": "SF Tourism Tips",
        "event_url": "https://www.sftourismtips.com/food-festivals-in-san-francisco.html",
        "start_time": "2026-03-28T16:00:00",
        "end_time": "2026-03-28T16:00:00",
        "verified": false
    }
]
```
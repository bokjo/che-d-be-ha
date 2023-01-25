# Examples

## Contracts

### GET /contracts/:id

```bash
curl --location --request GET 'http://localhost:3001/contracts/1' \
     --header 'profile_id: 1'
```

```json
{
    "id": 1,
    "terms": "bla bla bla",
    "status": "terminated",
    "createdAt": "2023-01-25T20:20:20.812Z",
    "updatedAt": "2023-01-25T20:20:20.812Z",
    "ContractorId": 5,
    "ClientId": 1
}
```

### GET /contracts

```bash
curl --location --request GET 'http://localhost:3001/contracts' \
     --header 'profile_id: 2'
```

```json
[
    {
        "id": 3,
        "terms": "bla bla bla",
        "status": "in_progress",
        "createdAt": "2023-01-25T20:20:20.812Z",
        "updatedAt": "2023-01-25T20:20:20.812Z",
        "ContractorId": 6,
        "ClientId": 2
    },
    {
        "id": 4,
        "terms": "bla bla bla",
        "status": "in_progress",
        "createdAt": "2023-01-25T20:20:20.813Z",
        "updatedAt": "2023-01-25T20:20:20.813Z",
        "ContractorId": 7,
        "ClientId": 2
    }
]
```

## Jobs

### GET /jobs/unpaid

```bash
curl --location --request GET 'http://localhost:3001/jobs/unpaid' \ 
     --header 'profile_id: 4'
```

```json
[
    {
        "id": 5,
        "description": "work",
        "price": 200,
        "paid": null,
        "paymentDate": null,
        "createdAt": "2023-01-25T20:20:20.813Z",
        "updatedAt": "2023-01-25T20:20:20.813Z",
        "ContractId": 7,
        "Contract": {
            "id": 7,
            "terms": "bla bla bla",
            "status": "in_progress",
            "createdAt": "2023-01-25T20:20:20.813Z",
            "updatedAt": "2023-01-25T20:20:20.813Z",
            "ContractorId": 7,
            "ClientId": 4
        }
    }
]
```

### POST /jobs/:job_id/pay

```bash
curl --location --request POST 'http://localhost:3001/jobs/3/pay' \
     --header 'profile_id: 2'
```

```json
{
    "message": "Payment successful for job with id: 3"
}
```

## Balances

### POST /balances/deposit/:userId

```bash
curl --location --request POST 'http://localhost:3001/balances/deposit/2' \
     --header 'profile_id: 2' \
     --header 'Content-Type: application/json' \
     --data-raw '{
        "amount": 42
      }'
```

```json
{
    "message": "Balance deposit successful"
}
```

## Admin

### GET /admin/best-profession?start=\<date>&end=\<date>

```bash
curl --location --request GET 'http://localhost:3001/admin/best-profession?start=2023-01-20&end=2023-01-30' \
     --header 'profile_id: 1'
```

```json
{
    "profession": "Programmer"
}
```

### GET /admin/best-clients?start=\<date>&end=\<date>&limit=\<integer>

```bash
curl --location --request GET 'http://localhost:3001/admin/best-clients?start=2023-01-20&end=2023-01-30&limit=3' \
     --header 'profile_id: 1'
```

```json
[
    {
        "id": 4,
        "fullName": "Ash Kethcum",
        "paid": 2020
    },
    {
        "id": 2,
        "fullName": "Mr Robot",
        "paid": 644
    },
    {
        "id": 1,
        "fullName": "Harry Potter",
        "paid": 643
    }
]
```

let json = `{
  "invoice_id": "INV-001",
  "date": "2024-12-01",
  "due_date": "2024-12-15",
  "seller": {
    "name": "ACME Corporation",
    "address": {
      "street": "123 Business Street",
      "city": "Metropolis",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA"
    },
    "contact": {
      "email": "sales@acme.com",
      "phone": "+1-555-123-4567"
    }
  },
  "buyer": {
    "name": "John Doe",
    "address": {
      "street": "456 Elm Street",
      "city": "Springfield",
      "state": "IL",
      "zip_code": "62704",
      "country": "USA"
    },
    "contact": {
      "email": "john.doe@example.com",
      "phone": "+1-555-987-6543"
    }
  },
  "items": [
    {
      "item_id": "ITEM-001",
      "description": "Wireless Keyboard",
      "quantity": 1,
      "unit_price": 49.99,
      "total": 49.99
    },
    {
      "item_id": "ITEM-002",
      "description": "Bluetooth Mouse",
      "quantity": 2,
      "unit_price": 25.50,
      "total": 51.00
    }
  ],
  "subtotal": 100.99,
  "tax": {
    "rate": 8.25,
    "amount": 8.33
  },
  "total": 109.32,
  "currency": "USD",
  "notes": "Thank you for your business!",
  "payment_status": "Unpaid",
  "payment_methods": ["Credit Card", "Bank Transfer"],
  "terms": "Payment due within 14 days from the invoice date."
}
`;

let mapping = `{
  "$.header.invoice_number": ["$.invoice_id", (id) => id.split("-").at(-1)],
  "$.header.document_type": "INVOICE",
  "$.header.posting_date": new Date(),
  "$.header.due_date": ["$.due_date", (date) => new Date(date)],
  "$.header.currency": "USD",
  "$.header.reference_number": null,
  "$.header.status": ["$.payment_status", (status) => status === 'Paid' ? 'Closed' : 'Open'],
  "$.line_items": ["$.items", (items) => {
    return items.map((item, index) => ({
      line_item_number: index + 1,
      product_id: item.item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_of_measure: "EACH",
      total: item.total
    }))
  }],
  "$.totals.subtotals": "$.subtotal",
  "$.taxes[]": ["$.tax", (obj) => {
    return {"tax_code": "TX001", ...obj}
  }]
}`;

export default {
    json,
    mapping,
};

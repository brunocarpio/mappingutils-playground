export let invoiceSample = {
  schema: `{
  "properties": {
    "invoice_id": {
      "type": "string"
    },
    "date": {
      "type": "string"
    },
    "due_date": {
      "type": "string"
    },
    "seller": {
      "properties": {
        "name": {
          "type": "string"
        },
        "address": {
          "properties": {
            "street": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "zip_code": {
              "type": "string"
            },
            "country": {
              "type": "string"
            }
          }
        },
        "contact": {
          "properties": {
            "email": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          }
        }
      }
    },
    "buyer": {
      "properties": {
        "name": {
          "type": "string"
        },
        "address": {
          "properties": {
            "street": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "zip_code": {
              "type": "string"
            },
            "country": {
              "type": "string"
            }
          }
        },
        "contact": {
          "properties": {
            "email": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          }
        }
      }
    },
    "items": {
      "elements": {
        "properties": {
          "item_id": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "quantity": {
            "type": "float32"
          },
          "unit_price": {
            "type": "float32"
          }
        }
      }
    },
    "tax": {
      "properties": {
        "rate": {
          "type": "float32"
        },
        "amount": {
          "type": "float32"
        }
      }
    },
    "notes": {
      "type": "string"
    },
    "payment_status": {
      "type": "string"
    },
    "payment_methods": {
      "elements": {
        "type": "string"
      }
    },
    "terms": {
      "type": "string"
    }
  }
}`,
  source: `{
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
      "unit_price": 49.99
    },
    {
      "item_id": "ITEM-002",
      "description": "Bluetooth Mouse",
      "quantity": 2,
      "unit_price": 25.50
    }
  ],
  "tax": {
    "rate": 8.25,
    "amount": 8.33
  },
  "notes": "Thank you for your business!",
  "payment_status": "Unpaid",
  "payment_methods": ["Credit Card", "Bank Transfer"],
  "terms": "Payment due within 14 days from the invoice date."
}`,
  mapping: `let m = {
  "$.line_items[]": ["$.items[*]", (item) => {
    return {
      item_sku: item.item_id,
      item_desc: item.description,
      unit_of_measure: "EACH",
      qty: item.quantity,
      unit_price: item.unit_price,
      total: (item.quantity * item.unit_price).toFixed(2)
    }
  }],

  "$.header.invoice_number": ["$.invoice_id", (id) =>
    id.split("-").at(-1)],
  "$.header.document_type": "INVOICE",
  "$.header.posting_date": "$.date",
  "$.header.due_date": "$.due_date",
  "$.header.currency": "USD",
  "$.header.reference_number": null,
  "$.header.status": ["$.payment_status", (status) =>
    status === 'Paid' ? 'Closed' : 'Open'],

  "$.totals.subtotals": ["$.items", (items) =>
    items.map(item => item.quantity * item.unit_price)
    .reduce((a,b) => a + b).toFixed(2)
  ],

  "$.taxes[]": ["$.tax", (obj) => {
    return {"tax_code": "TX001", ...obj}
  }]
}`,
};

export let itemSample = {
  schema: `{
  "properties": {
    "product": {
      "properties": {
        "id": {
          "type": "string"
        },
        "price": {
          "type": "string"
        }
      }
    }
  }
}`,
  source: `{
  "product": {
    "id": "QL-54905",
    "price": "USD 500"
  }
}`,
  mapping: `let m = {
  "$.product_number": "$.product.id",
  "$.price.currency": ["$.product.price",
    (price) => price.split(" ")[0]],
  "$.price.amount": ["$.product.price",
    (price) => price.split(" ")[1]],
}`,
};

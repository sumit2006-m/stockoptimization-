document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    form.addEventListener('submit', () => {
      form.classList.add('is-submitting');
    });
  });

  const editForm = document.getElementById('edit-form');
  const cancelEdit = document.getElementById('cancel-edit');
  const productIdField = document.getElementById('edit-product-id');
  const productNameField = document.getElementById('edit-product-name');
  const purchaseCostField = document.getElementById('edit-purchase-cost');
  const sellingPriceField = document.getElementById('edit-selling-price');
  const storageField = document.getElementById('edit-storage');
  const quantityField = document.getElementById('edit-quantity');

  document.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      productIdField.value = button.dataset.id;
      productNameField.value = button.dataset.name;
      purchaseCostField.value = button.dataset.cost;
      sellingPriceField.value = button.dataset.price;
      storageField.value = button.dataset.storage;
      quantityField.value = button.dataset.quantity;
      editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  cancelEdit?.addEventListener('click', () => {
    editForm.reset();
    productIdField.value = '';
  });

  editForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = productIdField.value;
    const payload = {
      product_name: productNameField.value,
      purchase_cost: purchaseCostField.value,
      selling_price: sellingPriceField.value,
      storage: storageField.value,
      quantity: quantityField.value,
    };

    fetch(`/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => window.location.reload());
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      fetch(`/products/${id}`, { method: 'DELETE' }).then(() => window.location.reload());
    });
  });
});

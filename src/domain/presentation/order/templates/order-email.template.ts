export const generateOrderEmailTemplate = (
  orderData: any,
  clientName: string,
  clientIdToShow: string,
  salesPersonName: string
): string => {
  const itemsInOrder = orderData.items?.length || 0;
  const subTotal = orderData.subTotal || 0;
  const tax = orderData.tax || 0;
  const total = orderData.total || 0;
  const discount = orderData.discounts || 0;
  const subTotalSinDescuentos = subTotal + discount;

  return `
  <div style="max-width:800px; margin:auto; padding:20px; border:1px solid #ccc; fonnt-family:Arial, sans-serif; font-size:14px;">
    
    <!-- Header con Logo -->
    <div style="text-align:center; margin-bottom:20px;">
      <img 
        src="https://res.cloudinary.com/dra2td6jr/image/upload/v1756990004/Logo_c2lvhf.jpg" 
        alt="Ferrelectricos Restrepo" 
        style="width:180px; height:auto; margin-bottom:15px; opacity:0.95;" 
      />
      <h2 style="color:#000; margin:0; font-size:28px;">ORDEN DE PEDIDO</h2>
      <h3 style="color:#53335d; margin:5px 0; font-weight:600;">#${orderData._id?.toString().slice(-6) || 'N/A'}</h3>
      <h4 style="font-size:16px; margin:10px 0 0 0; color:#000;">Estado de la Orden</h4>
      <div style="margin-top:10px;">
        <span style="
          background-color:${orderData.isPaid ? '#22c55e' : '#F2B318'};
          color:#000;
          font-weight:700;
          text-transform:uppercase;
          padding:4px 12px;
          border-radius:6px;">
          ${orderData.isPaid ? 'Gestionada' : 'Pendiente'}
        </span>
      </div>
      <hr style="margin:15px 0; border:none; border-top:1px solid #ddd;">
    </div>

    <!-- Order Info -->
    <div style="margin-bottom:20px; display:flex; justify-content:space-between;">
      <div style="width:48%;">
        <h4 style="margin:0 0 10px 0;">Información del Pedido</h4>
        <p><strong>Fecha:</strong> ${orderData.createdDate ? new Date(orderData.createdDate).toLocaleDateString('es-CO') : 'N/A'}</p>
        <p><strong>Vendedor:</strong> ${salesPersonName}</p>
      </div>
      <div style="width:48%;">
        <h4 style="margin:0 0 10px 0;">Cliente</h4>
        <p><strong>Nombre:</strong> ${clientName}</p>
        <p><strong>ID Cliente:</strong> ${clientIdToShow}</p>
      </div>
    </div>

    <!-- Shipping Address -->
    ${orderData.OrderAddress ? `
    <div style="margin-bottom:20px; background:#f8f9fa; padding:12px; border-radius:8px;">
      <h4 style="margin:0 0 10px 0;">Dirección de Envío</h4>
      <p><strong>Dirección:</strong> ${orderData.OrderAddress.address || 'N/A'}</p>
      <p><strong>Ciudad:</strong> ${orderData.OrderAddress.city || 'N/A'}</p>
      <p><strong>Código Postal:</strong> ${orderData.OrderAddress.postalCode || 'N/A'}</p>
      <p><strong>Teléfono:</strong> ${orderData.OrderAddress.phone || 'N/A'}</p>
    </div>
    ` : ''}

    <!-- Ofertas Aplicadas -->
    ${orderData.offers && orderData.offers.length > 0 ? `
    <div style="margin-bottom:20px; background:#e8f4f8; padding:12px; border-radius:8px; border-left:4px solid #F2B318;">
      <h4 style="margin:0 0 10px 0;">Ofertas Aplicadas</h4>
      ${orderData.offers.map((offer: any) => `
        <div style="margin-bottom:8px; padding:8px; background:#fff; border-radius:4px;">
          <strong style="color:#F2B318;">${offer.name}</strong> - ${offer.percentage}% de descuento
          ${offer.typePackage === 'inner' && offer.minimumQuantity ?
      `(mínimo ${offer.minimumQuantity} unidades)` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Items -->
    <div style="margin:20px 0;">
      <h4 style="margin:0 0 10px 0;">Productos en la Orden</h4>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#cccccc;">
            <th style="border:1px solid #ddd; padding:10px; text-align:left;">Producto</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:center;">Referencia</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:center;">Cantidad</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:right;">Precio Unit.</th>
            <th style="border:1px solid #ddd; padding:10px; text-align:right;">Total producto</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items?.map((item: any) => {
        const productName = item.idProduct?.description || item.idProduct?.detalle || 'Producto sin nombre';
        const reference = item.idProduct?.reference || 'N/A';
        const unitPrice = item.price;
        const quantity = item.quantity || 0;
        const subtotal = item.price * item.quantity;

        return `
              <tr>
                <td style="border:1px solid #ddd; padding:8px;">
                  <div style="font-weight:600;">${productName}</div>
                  <div style="font-size:12px; color:#666;">ID: ${item.idProduct?._id?.toString().slice(-6) || 'N/A'}</div>
                </td>
                <td style="border:1px solid #ddd; text-align:center;">${reference}</td>
                <td style="border:1px solid #ddd; text-align:center;">${quantity}</td>
                <td style="border:1px solid #ddd; text-align:right;">$${unitPrice.toLocaleString('es-CO')}</td>
                <td style="border:1px solid #ddd; text-align:right; font-weight:600;">$${subtotal.toLocaleString('es-CO')}</td>
              </tr>
            `;
      }).join('') || `
            <tr>
              <td colspan="5" style="border:1px solid #ddd; padding:20px; text-align:center; color:#666;">
                No hay productos en esta orden.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
<div style="margin-top:20px; text-align:right;">
  <table style="width:300px; margin-left:auto; border-collapse:collapse;">
    <tr>
      <td style="padding:5px; text-align:right;"><strong>No. Productos:</strong></td>
      <td style="padding:5px; text-align:right;">
        ${itemsInOrder === 1 ? '1 artículo' : `${itemsInOrder} artículos`}
      </td>
    </tr>

    <tr>
      <td style="padding:5px; text-align:right;"><strong>Subtotal:</strong></td>
      <td style="padding:5px; text-align:right;">
        $${subTotalSinDescuentos.toLocaleString('es-CO')}
      </td>
    </tr>

    ${discount > 0 ? `
      <tr>
        <td style="padding:5px; text-align:right;"><strong>Descuento:</strong></td>
        <td style="padding:5px; text-align:right; color:#d32f2f; font-weight:600;">
          -$${discount.toLocaleString('es-CO')}
        </td>
      </tr>
      <tr>
        <td style="padding:5px; text-align:right;"><strong>Subtotal con descuento:</strong></td>
        <td style="padding:5px; text-align:right;">
          $${subTotal.toLocaleString('es-CO')}
        </td>
      </tr>
    ` : ''}

    <tr>
      <td style="padding:5px; text-align:right;"><strong>Impuestos (19%):</strong></td>
      <td style="padding:5px; text-align:right;">
        $${tax.toLocaleString('es-CO')}
      </td>
    </tr>

    <tr style="background:#F2B318;">
      <td style="padding:10px; text-align:right; color:#000;">
        <strong style="font-size:16px;">TOTAL:</strong>
      </td>
      <td style="padding:10px; text-align:right; color:#000;">
        <strong style="font-size:16px;">
          $${total.toLocaleString('es-CO')}
        </strong>
      </td>
    </tr>
  </table>
</div>
`;
};

package com.sparehub.dto.response.order;



public record CancellationProcessResponse(

        OrderResponse order,
        Boolean refundCreated,
        RefundResponse refund,
        Boolean stockReversed
) {
}

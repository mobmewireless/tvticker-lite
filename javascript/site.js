
function configure_rpc() {
    $.jsonRPC.setup({
        endPoint: 'http://localhost:3000/service',
    });
}

$(function() {
    configure_rpc();
})
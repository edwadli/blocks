var COUNT = document.getElementById('count');

$.ajax({
    url: '/api/count',
    type: 'GET',
    dataType: 'JSON',
    success: function (result) {
        COUNT.innerHTML='Count: ' + result.count.toString();
    },
    error: function(error) {
        console.log(error);
    }
});

$('#increment').click(function() {
    $.ajax({
        url: '/api/count',
        type: 'POST',
        data: {},
        dataType: 'JSON',
        success: function(result) {
            COUNT.innerHTML='Count: ' + result.count.toString();
        },
        error: function(error) {
            console.log(error);
        }
    });
});

$('#reset').click(function() {
    $.ajax({
        url: '/api/reset',
        type: 'POST',
        data: {},
        dataType: 'JSON',
        success: function(result) {
            COUNT.innerHTML='Count: ' + result.count.toString();
        },
        error: function(error) {
            console.log(error);
        }
    });
});

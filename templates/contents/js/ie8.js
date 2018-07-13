$(document).ready(function () {
    if (getQueryString('t')) {
        var url = '//cloud.boxnet.com.br/api/criptografia/descriptografar?texto=' + getQueryString('t');
        $.ajax({url: url, contentType: 'text/plain', type: 'GET'})
            .done(function (query) {
                var obj = JSON.parse('{"' + decodeURI(query.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
                init(obj);
            })
    } else {
        var obj = JSON.parse('{"' + decodeURI(window.location.href.split("?")[1].replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
        init(obj);
    }
    function init(query) {
        if (query.email) {
            var url = "//cloud.boxnet.com.br/api/BookRelatorioAcessoMateria/InserirRelatorioAcessomateriasBook?destinatario=" +
                query.email + "&idNoticia=" + query.idNoticia + "&idBookVersao=" + query.idBookVersao;
            $.ajax({url: url, contentType: 'text/plain', type: 'GET'})
                .done(function () {
                    redirect(query);
                })
                .fail(function (error) {
                    console.log('Erro ao registrar acesso da notícia', error)
                });
        } else {
            redirect(query);
        }
        function redirect(query) {
            if (parseInt(query.idNoticia)) {
                var q = '?b=' + query.idBook + '&pmvc=' + query.idProdutoMvc + '&n=' + query.idNoticia;
                var u = 'http://book1.boxnet.com.br/Visualizar/' + q;
                window.location.assign(u);
            }
            else {
                var url = "//cloud.boxnet.com.br/api/BookVersao/GetIdUltimaVersaoDoBook?idBook=" + query.idBook;
                $.ajax({url: url, contentType: 'text/plain', type: 'GET'})
                    .done(function (idBookVersao) {
                        var q = '?b=' + idBookVersao + '&pmvc=' + query.idProdutoMvc;
                        var u = 'http://book1.boxnet.com.br/Visualizar/' + q;
                        window.location.assign(u);
                    }).fail(function (error) {
                        console.log('Erro ao carregar o idBookVersao', error)
                    });
            }
        }
    }
});
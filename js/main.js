const API_TOKEN = 'a6ec55d716fd3d21c7280c89985206da';

const main = $('main');
const articleTemplate = $($('#article-template').prop('content'));
const openFilterBtn = $('[data-bs-target="#filter-modal"]');
const searchBarToggle = $('[data-bs-target="#searchbar-collapse"]');
const searchInput = $('#search-input');
const topicsBarToggle = $('[data-bs-target="#topics-collapse"]');

// Xử lý nội dung người dùng tìm kiếm để có thể gửi đi được
function enhanceSearchPhrase(phrase) {
    return phrase
        .replace(/"/g, '')
        .replace(/\s+/g, ' ')
        .replace(/(\s|^)\S*[^a-zA-Z0-9 ]+\S*(?=\s|$)/g, match => {
            return ' "' + match.trim() + '"';
        })
        .trim();
}

// Lấy và hiển thị dữ liệu từ trang GNews với endpoint và các tham số được truyền vào
function getArticles(endpoint, params = '') {
    $(window).scrollTop(0);
    openFilterBtn.removeClass('filtered');
    $('label.active').removeClass('active').children('input').prop('checked', false);

    // Hiển thị hiệu ứng loading
    main.html('');
    for (let i = 0; i < 10; i++) {
        main.append(articleTemplate.clone());
    }

    // Lấy dữ liệu từ API
    $.getJSON(`https://gnews.io/api/v4/${endpoint}?token=${API_TOKEN}&${params}`, data => {
        main.html('');

        if (!data.totalArticles) {
            // Hiển thị thông báo khi không tìm thấy bài báo nào
            main.html('<p class="text-center py-3 fs-5">No results found.</p>');
        } else {
            // Hiển thị từng bài báo
            data.articles.forEach(article => {
                let articleEl = articleTemplate.clone();

                // Thay các dữ liệu lấy được vào vị trí các placeholder của bài báo
                articleEl.find('.card-img-top').replaceWith(
                    $('<img>')
                        .addClass('card-img-top placeholder')
                        .attr('src', article.image)
                        .on('load error', function () {
                            $(this)
                                .removeClass('placeholder')
                                .closest('article')
                                .removeClass('placeholder-glow');
                        })
                );

                articleEl.find('.card-title').html(
                    $('<a>')
                        .addClass('stretched-link')
                        .attr({
                            href: article.url,
                            target: '_blank'
                        })
                        .text(article.title)
                );

                articleEl.find('.description').text(article.description);

                let source = $('<a>')
                    .addClass('source-name')
                    .attr({
                        href: article.source.url,
                        target: '_blank',
                        title: 'Go to ' + article.source.name
                    })
                    .text(article.source.name);

                let time = new Date(article.publishedAt).toLocaleString('vi');

                articleEl
                    .find('.footer-text > small')
                    .addClass('text-muted')
                    .html(`${source.get(0).outerHTML} &centerdot; <time>${time}</time>`);

                // Gắn bài báo vào thân trang web
                main.append(articleEl);
            });
        }

        // Hiển thị thông báo lỗi khi lấy dữ liệu thất bại
    }).fail(err => {
        let errorMessage = 'Error: ' + err.status + ' - ' + err.responseJSON.errors;

        // Nếu lỗi là do hết lượt lấy dữ liệu thì thông báo cho người dùng một cách dễ hiểu hơn
        if (err.status == 403) {
            errorMessage = 'Oops! You have read too much news today. Please come back tomorrow.';
        }

        main.html(`<p class="text-center py-3 fs-5">${errorMessage}</p>`);
    });
}

// Đổi chủ đề khi người dùng nhấn vào chủ đề đó
$('#topics-bar').on('change', 'input', function () {
    // Nếu thiết bị có màn hình nhỏ thì ẩn thanh chủ đề sau khi người dùng đổi chủ đề
    if ($(window).width() <= 768) topicsBarToggle.click();

    getArticles('top-headlines', 'topic=' + $(this).val());

    $('#topics-bar label.active').removeClass('active');
    $(this).parent().addClass('active');
});

// Tìm kiếm với từ khóa mà người dùng nhập vào
$('#search-form').on('submit', event => {
    event.preventDefault();
    // Nếu thiết bị có màn hình nhỏ thì ẩn thanh tìm kiếm sau khi người dùng tìm kiếm
    if ($(window).width() <= 768) searchBarToggle.click();

    getArticles('search', $.param({ q: enhanceSearchPhrase(searchInput.val()) }));
});

// Khi thanh tìm kiếm mở ra trên thiết bị có màn hình nhỏ thì hiển thị bàn phím ảo
searchBarToggle.on('click', () => {
    if (!$('#searchbar-collapse').hasClass('show') && !searchBarToggle.hasClass('collapsed')) {
        searchInput.focus();
    }
});

// Các tin tức hàng đầu sẽ được hiển thị khi người dùng vào trang web
getArticles('top-headlines');
$('input[name=topic][value=breaking-news]').parent().addClass('active');

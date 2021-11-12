const filterForm = $('#filter-form');
const filterInputs = filterForm.find('.filter-input').toArray();
const searchBtn = filterForm.find('[type=submit]');
const closeBtn = filterForm.find('.btn-close');

filterForm.on({
    submit: event => {
        event.preventDefault();
        let keywords = $('#keywords').val();
        let exactMatch = $('#exact-match').val();
        let excludeWords = $('#exclude-words').val();

        // Đối tượng chứa một số tham số cần xử lý đặc biệt trước khi gửi
        // Sô tham số còn lại sẽ lấy trực tiếp từ biểu mẫu
        let specialParams = {
            // Xử lý và nối các đoạn tìm kiếm lại
            q: (
                enhanceSearchPhrase(keywords) +
                exactMatch.replace(/"/g, '').replace(/.+/, ' "$&"') +
                enhanceSearchPhrase(excludeWords).replace(/\s|^(?=.+)/g, ' NOT ')
            ).trim(),

            // Gắn giờ cho ngày bắt đầu và kết thúc
            // Do GNews yêu cầu thời gian phải ở định dạng đầy đủ ngày giờ
            from: $('#start-date').val().replace(/.+/, '$&T00:00:00Z'),
            to: $('#end-date').val().replace(/.+/, '$&T23:59:59Z')
        };

        // Lấy dữ liệu được lọc
        let endpoint =
            specialParams.q && !filterForm.find('[name=topic]').val() ? 'search' : 'top-headlines';
        let params = $.param(specialParams) + '&' + filterForm.serialize();
        getArticles(endpoint, params);

        // Xử lý sau khi lọc
        closeBtn.click();
        searchInput.val('');
        openFilterBtn.addClass('filtered');
        if ($(window).width() <= 768) searchBarToggle.click();
    },

    input: () => {
        // Chỉ cần một trong số các tiêu chí lọc được cung cấp thì sẽ cho phép người dùng được lọc
        searchBtn.toggleClass('disabled', !filterInputs.some(input => input.value.trim()));
    },

    reset: () => {
        searchBtn.addClass('disabled');
    }
});

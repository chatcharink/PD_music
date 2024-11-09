class ApplicationDatatable < AjaxDatatablesRails::ActiveRecord
    extend Forwardable
    def_delegators :@view, :link_to, :url_for

    def action_html(actions)
        "<div class='dropdown'>
            <a class='' href='#' role='button' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            <i class=''></i>
            </a>
            <div class=''>
            #{actions}
            </div>
        </div>".html_safe
    end
  
    def tag_column(record)
      record.tags.map do |tag|
        @view.link_to(tag.name, @view.tag_path(tag))
      end.join(", ").html_safe
    end
end
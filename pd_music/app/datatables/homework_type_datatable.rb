class HomeworkTypeDatatable < ApplicationDatatable
  def_delegators :@view, :homework_type_path, :edit_homework_type_path, :can_view_menu?, :session

  def initialize(params, opts = {})
    @view = opts[:view_context]
    super
  end

  def view_columns
    # Declare strings in this format: ModelName.column_name
    # or in aliased_join_table.column_name format
    @view_columns ||= {
      homework_type: { source: "HomeworkType.homework_type", cond: :like },
      description: { source: "HomeworkType.description", cond: :like },
      update_date: { source: "Category.updated_at", cond: :like },
      action: { source: "Category.updated_at", cond: :like }
    }
  end

  def data
    records.map do |record|
      {
        homework_type: record.homework_type,
        description: record.description,
        update_date: record.updated_at.strftime("%d/%m/%Y %H:%M:%S"),
        action: action(record)
      }
    end
  end

  def get_raw_records
    HomeworkType.where(status: "active")
  end

  def action record
    action = []
    if can_view_menu?([71])
      action << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-pencil-square icon mx-1\" viewBox=\"0 0 16 16\" data-action=\"click->homework-type#getHomeworkType\" data-homework-type-id-param=\"#{record.id}\" data-homework-type-url-param=\"#{edit_homework_type_path(id: record.id)}\" data-bs-toggle=\"modal\" data-bs-target=\"#createHomeworkType\"><path d=\"M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z\"/><path fill-rule=\"evenodd\" d=\"M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z\"/></svg>"
    end
    
    if can_view_menu?([72])
      action << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-trash-fill icon mx-1\" viewBox=\"0 0 16 16\" data-bs-toggle=\"modal\" data-bs-target=\"#deleteHomeworkTypeModal\" data-action=\"click->homework-type#setDeleteId\" data-homework-type-name-param=\"#{record.homework_type}\" data-homework-type-url-param=#{homework_type_path(id: record.id, name: record.homework_type)}><path d=\"M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0\"/></svg>"
    end
    return action.join(" ").html_safe
  end

end

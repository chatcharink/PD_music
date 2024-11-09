class DashboardTeacherDatatable < ApplicationDatatable

  def view_columns
    # Declare strings in this format: ModelName.column_name
    # or in aliased_join_table.column_name format
    @view_columns ||= {
      caution: { source: "HomeworkUserMapping.id", cond: :eq },
      name: { source: "HomeworkUserMapping.name", cond: :like },
      task_name: { source: "HomeworkUserMapping.name", cond: :like },
      score: { source: "HomeworkUserMapping.score", cond: :like },
      category: { source: "", cond: :like },
      status: { source: "HomeworkUserMapping.status", cond: :like },
      estimate_date: { source: "HomeworkUserMapping.updated_at", cond: :like },
    }
  end

  def data
    records.map do |record|
      {
        caution: caution(record.estimate_date, record.status),
        name: "#{record.firstname} #{record.lastname}",
        task_name: record.task_name,
        score: "#{record.score}/#{record.full_score}",
        category: @category[record.category_id]["name_en"],
        status: status_btn(record.status),
        estimate_date: record.estimate_date.strftime("%d/%m/%Y")
      }
    end
  end

  def get_raw_records
    @category = Category.all.index_by(&:id)
    hw = HomeworkUserMapping.select("homeworks.*, homework_user_mappings.*, users.firstname, users.lastname")
    hw = hw.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
    hw = hw.joins("left join users on users.id = homework_user_mappings.user_id")
    hw = hw.where("homeworks.status = ?", "active")
    is_not_send = false

    if params["goingOverdue"] == "true" && params["overdue"] == "true"
      hw = hw.where("estimate_date between ? and ? OR estimate_date < ?", DateTime.now(), Date.today.beginning_of_week(:monday)+7, DateTime.now())
      is_not_send = true
    elsif params["goingOverdue"] == "true"
      hw = hw.where("estimate_date between ? and ?", DateTime.now(), Date.today.beginning_of_week(:monday)+7).order(estimate_date: :ASC)
      is_not_send = true
    elsif params["overdue"] == "true"
      hw = hw.where("estimate_date < ?", DateTime.now())
      is_not_send = true
    end

    if params["group_id"].present?
      hw = hw.where("users.musical_instrument_id = ?", params["group_id"])
    end

    if params["id"].present?
      hw = hw.where("homework_user_mappings.user_id = ?", params["id"])
    end

    if params["class"].present?
      hw = hw.where("users.study_class = ?", params["class"])
    end

    if params["exam_date"].present?
      exam_date = get_date_exam(params["exam_date"])
      hw = hw.where(exam_date).where("users.exam_date is not null")
    end

    if params["category_id"].present?
      hw = hw.where("homeworks.category_id = ?", params["category_id"])
    end

    hw = hw.where(status: ["open", "reject"]) if is_not_send    
    hw
  end

  def caution estimate_date, status
    caution_div = []
    if estimate_date.between?(DateTime.now(), Date.today.beginning_of_week(:monday)+7) && ["open", "reject"].include?(status)
      caution_div << '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-diamond-fill dashbaord-icon-warning" viewBox="0 0 16 16" title="This task is about to go overdue."><path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>'
    elsif (estimate_date - DateTime.now() < 0) && ["open", "reject"].include?(status)
      caution_div << '<span class="dashbaord-icon-error rounded-3 p-1">Overdue</span>'
    end
    caution_div.join(" ").html_safe
  end
  
  def status_btn status
    div_status = []
    div_status << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-circle-fill table-status-#{status}\" viewBox=\"0 0 16 16\">"
    div_status << "<circle cx=\"8\" cy=\"8\" r=\"8\"/></svg><span class=\"ms-1\">"
    div_status << status.capitalize
    div_status << "</span>"
    div_status.join(" ").html_safe
  end

  def get_date_exam date
    today = DateTime.now()
    today_str = today.strftime("%d/%m/%Y")
    case going_exam_date.downcase
    when "1 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+1.day).strftime("%d/%m/%Y")}"
    when "2 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+2.day).strftime("%d/%m/%Y")}"
    when "3 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+3.day).strftime("%d/%m/%Y")}"
    when "4 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+4.day).strftime("%d/%m/%Y")}"
    when "5 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+5.day).strftime("%d/%m/%Y")}"
    when "6 day"
        exam_date = "users.exam_date between #{today_str} and #{(today+6.day).strftime("%d/%m/%Y")}"
    when "1 week"
        exam_date = "users.exam_date between #{today_str} and #{(today+7.day).strftime("%d/%m/%Y")}"
    when "2 week"
        exam_date = "users.exam_date between #{today_str} and #{(today+14.day).strftime("%d/%m/%Y")}"
    when "3 week"
        exam_date = "users.exam_date between #{today_str} and #{(today+21.day).strftime("%d/%m/%Y")}"
    when "1 month"
        exam_date = "users.exam_date between #{today_str} and #{(today.next_month).strftime("%d/%m/%Y")}"
    else
        exam_date = "users.exam_date >= #{today_str}"
    end
    exam_date
  end

end

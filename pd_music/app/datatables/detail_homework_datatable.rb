class DetailHomeworkDatatable < ApplicationDatatable
    def_delegators :@view, :session, :check_box_tag
  
    def initialize(params, opts = {})
        @view = opts[:view_context]
        super
    end
  
    def view_columns
        # Declare strings in this format: ModelName.column_name
        # or in aliased_join_table.column_name format
        @view_columns ||= {
            id: { source: "User.id", cond: :eq },
            name: { source: "User.firstname", cond: :like },
            subject: { source: "Subjects.subject_name", cond: :like },
            homework: { source: "Homework.task_name", cond: :like },
            status: { source: "HomeworkUserMappings.status", cond: :like},
            estimatedDate: { source: "Homework.estimate_date", cond: :eq},
        }
    end
  
    def data
        records.map do |record|
            {
                id: check_box_tag("id", record.homework_mapping_id, false, class: "form-check-input check-user-detail", id: "check-user-detail-#{record.homework_mapping_id}", data: { action: "change->homework-detail#checkUserHomework"}),
                name: get_avatar(record),
                subject: record.subject_name,
                homework: record.task_name,
                status: get_status(record),
                estimatedDate: record.estimate_date.strftime("%d/%m/%Y") #get_dead_line(record.estimate_date, record.homework_type_id) #record.estimate_date.
            }
        end
    end
  
    def get_raw_records
        # insert query here
        homework = User.select("users.id, users.firstname, users.lastname, users.profile_pic, homeworks.id as homework_id, homeworks.task_name, homeworks.estimate_date, homeworks.full_score, homeworks.homework_type_id, homework_user_mappings.id as homework_mapping_id, homework_user_mappings.status, subjects.subject_name")
        homework = homework.joins("right join homework_user_mappings on homework_user_mappings.user_id = users.id")
        homework = homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        homework = homework.joins("left join subjects on subjects.id = homeworks.subject_id")
        homework = homework.order("homework_user_mappings.updated_at")

        homework = homework.where("users.firstname like ? ", "%#{params["name"]}%").or(homework.where("users.lastname like ? ", "%#{params["name"]}%")) if params["name"].present?
        homework = homework.where("subjects.id = ?", params["subject"]) if params["subject"].present?
        homework = homework.where("homeworks.id = ?", params["homework"]) if params["homework"].present?
        homework = homework.where("homework_user_mappings.status in (?)", params["status"]) if params["status"].present? && !params["status"].include?("all")
        homework = homework.where(get_date_exam(params["deadline"])) if params["deadline"].present?
        # questions = Question.select("homework_id, answer_format")
        # @homework_answer_format_list = Hash.new
        # questions.each do |q|
        #     @homework_answer_format_list[q.homework_id] ||= []
        #     @homework_answer_format_list[q.homework_id] << q.answer_format
        # end
        
        homework
    end

    def get_avatar user
        avatar = []
        picture_path = user.profile_pic.attached? ? url_for(user.profile_pic) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        avatar << "<img src='#{picture_path}' class='rounded-circle border' width='75px' height='75px' />"
        avatar << "<span class=\"ms-3\">#{user.firstname.capitalize} #{user.lastname.capitalize}</span>"
        return avatar.join(" ").html_safe
    end

    def get_status record
        icon = []
        icon << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-circle-fill homework-status-#{record.status}\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"8\"/></svg>"
        icon << "<span class=\"homework-status-text\">#{record.status.capitalize}</span>"
        if record.status == "send"
            icon << "<div style=\"font-size: 12px\">"
            icon << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-exclamation-triangle\" viewBox=\"0 0 16 16\"><path d=\"M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z\"/><path d=\"M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z\"/></svg>"
            icon << "<span><i>need check</i></span></div>"
        end
        icon << "<input type=\"hidden\" value=\"#{record.homework_id}\" class=\"homework_id\">"
        icon << "<input type=\"hidden\" value=\"#{record.homework_mapping_id}\" class=\"homework_mapping_id\">"
        icon << "<input type=\"hidden\" value=\"#{record.id}\" class=\"user_id\">"
        return icon.join(" ").html_safe
    end

    def get_dead_line estimate_date, homework_type
        closer_deadline = []
        closer_deadline << "#{estimate_date.strftime("%d/%m/%Y")}"
        time_now = DateTime.now()
        diff_time = Date.parse(estimate_date.strftime("%d/%m/%Y %H:%M")) - time_now
        if (homework_type == 2 && ( diff_time.to_f < 3 )) || (homework_type == 1 && ( diff_time.to_f < 0.5 ))
            closer_deadline << "<div class=\"d-inline ms-3\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-exclamation-circle-fill text-danger\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2\"/></svg></div>"
        end

        if diff_time.to_f < 0
            closer_deadline << "<input type=\"hidden\" value=\"true\" id=\"over_deadline\">"
        end
        return closer_deadline.join(" ").html_safe
    end

    def get_date_exam deadline
        today = DateTime.now()
        today_str = "#{today.strftime("%Y-%m-%d")} 00:00:00"
        exam_date = "homeworks.estimate_date between '#{today_str}' and '#{(today+(deadline.to_i).day).strftime("%Y-%m-%d")} 23:59:59'"
        return exam_date
    end

end
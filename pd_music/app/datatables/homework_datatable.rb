class HomeworkDatatable < ApplicationDatatable
    def_delegators :@view, :session
  
    def initialize(params, opts = {})
        @view = opts[:view_context]
        super
    end
  
    def view_columns
        # Declare strings in this format: ModelName.column_name
        # or in aliased_join_table.column_name format
        @view_columns ||= {
            subject: { source: "Homework.task_name", cond: :like },
            taskName: { source: "Homework.task_name", cond: :like },
            status: { source: "Homework.status", cond: :like },
            fullScore: { source: "Homework.full_score", cond: :eq},
            estimatedDate: { source: "Homework.estimate_date", cond: :like},
        }
    end
  
    def data
        records.map do |record|
            {
                subject: record.subject_name,
                taskName: record.task_name,
                status: get_status(record.status, record.homework_id),
                fullScore: get_score(record.score, record.full_score),
                estimatedDate: get_dead_line(record.estimate_date, record.homework_type_id, record.status) #record.estimate_date.strftime("%d/%m/%Y")
            }
        end
    end
  
    def get_raw_records
        # insert query here
        homework = HomeworkUserMapping.select("homeworks.id as homework_id, homeworks.task_name, homeworks.status as homework_status, homeworks.estimate_date, homeworks.full_score, homeworks.subject_id, homeworks.homework_type_id, homework_user_mappings.*, subjects.subject_name")
        homework = homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        homework = homework.joins("left join subjects on subjects.id = homeworks.subject_id")
        homework = homework.where(user_id: session["current_user"]["id"])
        homework = homework.where("homeworks.status = ?", "active")

        if params["category"].blank?
            homework = homework.where("homeworks.category_id = ?", 1)
        else
            homework = homework.where("homeworks.category_id = ?", params["category"])
        end

        if params["type"].blank?
            # homework = homework.where("homeworks.homework_type_id = ?", 1)
        else
            homework = homework.where("homeworks.homework_type_id = ?", params["type"])
        end

        homework
    end

    def get_score score, full
        return "#{score.to_i}/#{full.to_i}"
    end

    def get_status status, id
        icon = []
        icon << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-circle-fill homework-status-#{status}\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"8\"/></svg>"
        icon << "<span class=\"homework-status-text\">#{status.capitalize}</span>"
        icon << "<input type=\"hidden\" value=\"#{id}\" class=\"homework_mapping_id\">"
        return icon.join(" ").html_safe
    end

    def get_dead_line estimate_date, homework_type, status
        closer_deadline = []
        closer_deadline << "#{estimate_date.strftime("%d/%m/%Y")}"
        time_now = DateTime.now()
        diff_time = Date.parse(estimate_date.strftime("%d/%m/%Y %H:%M")) - time_now
        if ((homework_type == 2 && ( diff_time.to_f < 3 )) || (homework_type == 1 && ( diff_time.to_f < 0.5 )) && (status == "open" || status == "reject"))
            closer_deadline << "<div class=\"d-inline ms-3 position-absolute\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-exclamation-circle-fill text-danger\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2\"/></svg></div>"
        end

        if diff_time.to_f < 0 && (status == "open" || status == "reject")
            closer_deadline << "<input type=\"hidden\" value=\"true\" id=\"over_deadline\">"
        end
        return closer_deadline.join(" ").html_safe
    end
end
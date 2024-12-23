class ReportController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([1])
        @category = Category.where(status: "active").order(:id).index_by(&:id)
        @user = User.where(status: "active", role: 3).order(:id)
        @subject = Subject.where(subject_type: "homework", status: "active").order(:id)
        tag = Tag.where(status: "active").order(:id)
        selected_tag = tag.first.id
        selected_user = @user.first.id
        selected_category = @category.keys
        selected_subject = @subject.first.id

        homework = Homework.where(subject_id: selected_subject, status: "active").pluck(:id)
        @assign_homework = HomeworkUserMapping.select("tags.tag_name, homeworks.task_name, homeworks.tag_id, homeworks.homework_type_id, homeworks.estimate_date, homework_user_mappings.*").where(user_id: params["user"], homework_id: homework)
        @assign_homework = @assign_homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        @assign_homework = @assign_homework.joins("left join tags on tags.id = homeworks.tag_id")

        @progress = get_progress(@assign_homework, selected_tag)
        @graph = get_graph(@assign_homework, params["user"], selected_tag)
    end

    def filter_category
        if params["category"].blank?
            category = Category.where(status: "active").order(:id).index_by(&:id)
            selected_category = category.keys
        else
            selected_category = [params["category"]]
        end
        tag = Tag.where(status: "active").order(:id)
        selected_tag = tag.first.id
        homework = Homework.where(subject_id: params["subject"], category_id: selected_category[0], status: "active").pluck(:id)
        assign_homework = HomeworkUserMapping.select("tags.tag_name, homeworks.task_name, homeworks.tag_id, homeworks.homework_type_id, homeworks.estimate_date, homework_user_mappings.*").where(user_id: params["user"], homework_id: homework)
        assign_homework = assign_homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        assign_homework = assign_homework.joins("left join tags on tags.id = homeworks.tag_id")
        
        if homework.blank?
            render partial: "report/summary", locals: {homework: homework}
        else
            @progress = get_progress(assign_homework, selected_tag)
            @graph = get_graph(assign_homework, params["user"], selected_tag)
            render partial: "report/summary", locals: {homework: assign_homework, user: params["user"].to_i, subject: params["subject"].to_i, category: selected_category[0], selected_tag: nil, filter_graph: nil}
        end
    end

    def filter_homework
        # assign_homework = HomeworkUserMapping.where(user_id: params["user"])
        # homework = Homework.select("tag_name, homeworks.id, tag_id").where(subject_id: params["subject"], category_id: params["category"], status: "active").joins("left join tags on tags.id = homeworks.tag_id").order(:tag_id)
        # homework = Homework.where(subject_id: params["subject"], status: "active")
        homework = Homework.where(subject_id: params["subject"], category_id: params["category"], status: "active").pluck(:id)
        assign_homework = HomeworkUserMapping.select("tags.tag_name, homeworks.task_name, homeworks.tag_id, homeworks.homework_type_id, homeworks.estimate_date, homework_user_mappings.*").where(user_id: params["user"], homework_id: homework)
        assign_homework = assign_homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        assign_homework = assign_homework.joins("left join tags on tags.id = homeworks.tag_id")

        @progress = get_progress(assign_homework, params["tag"].to_i)
        @graph = get_graph(assign_homework, params["user"], params["tag"].to_i)
        render partial: "report/summary", locals: {homework: assign_homework, user: params["user"].to_i, subject: params["subject"].to_i, category: params["category"], selected_tag: params["tag"].to_i, filter_graph: nil}
    end

    def filter_graph
        filter = params["filter"]

        homework = Homework.where(subject_id: params["subject"], status: "active").pluck(:id)
        assign_homework = HomeworkUserMapping.select("tags.tag_name, homeworks.task_name, homeworks.tag_id, homeworks.homework_type_id, homeworks.estimate_date, homework_user_mappings.*").where(user_id: params["user"], homework_id: homework)
        assign_homework = assign_homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        assign_homework = assign_homework.joins("left join tags on tags.id = homeworks.tag_id")
        # homework = Homework.select("tag_name, homeworks.id, tag_id").where(id: assign_homework.pluck(:homework_id), subject_id: params["subject"], status: "active").joins("left join tags on tags.id = homeworks.tag_id").order(:tag_id)
        # homework = Homework.where(subject_id: params["subject"], status: "active")

        graph = get_graph(assign_homework, params["user"], params["tag"].to_i, filter)
        
        render partial: "report/graph", locals: {graph: graph}
    end

    private
    def get_progress assign_homework, tag
        total_assign_homework = 0
        success_task = 0
        assign_homework.each do |hw|
            next if hw.tag_id.to_i != tag
            total_assign_homework += 1
            success_task += 1 if hw.status == "checked"
        end
        
        if total_assign_homework > 0
            return (((success_task.to_f/total_assign_homework.to_f))*100).round(2)
        else
            return 0
        end
    end

    def get_graph assign_homework, user, tag, filter = nil
        graph = [] 
        arr_data = {}
        development = DevelopmentUserMapping.select("tags.tag_name, development_user_mappings.*").where(user_id: user)
        development = development.joins("left join tags on tags.id = development_user_mappings.tag_id")
        if filter.blank?
            assign_homework.each do |hw|
                arr_data[hw.tag_name] ||= {}
                arr_data[hw.tag_name]["สมาธิ"] ||= 0
                arr_data[hw.tag_name]["พัฒนาการ"] ||= 0
                arr_data[hw.tag_name]["ส่งการบ้านรายวัน"] ||= 0
                arr_data[hw.tag_name]["total_daily"] = 0
                arr_data[hw.tag_name]["total_weekly"] = 0
                if hw.status == "checked" && hw.homework_type_id == 1
                    arr_data[hw.tag_name]["total_daily"] += 1
                    arr_data[hw.tag_name]["ส่งการบ้านรายวัน"] += frequency_daily_score(((hw.estimate_date - hw.send_date)/3600).round)
                end
                arr_data[hw.tag_name]["ส่งการบ้านรายสัปดาห์"] ||= 0
                if hw.status == "checked" && hw.homework_type_id == 2
                    arr_data[hw.tag_name]["total_weekly"] += 1
                    arr_data[hw.tag_name]["ส่งการบ้านรายสัปดาห์"] += frequency_weekly_score(((hw.estimate_date - hw.send_date)).round)
                end
            end
            if development.present?
                development.each do |dev|
                    # json = JSON.parse(dev.development)
                    arr_data[dev.tag_name]["สมาธิ"] ||= 0
                    arr_data[dev.tag_name]["พัฒนาการ"] ||= 0
                    json = dev.development
                    json.each do |k, v|
                        arr_data[dev.tag_name]["สมาธิ"] += v["meditate"].to_i
                        arr_data[dev.tag_name]["พัฒนาการ"] += v["development"].to_i
                    end
                end
            end
        else
            filter = filter.split(",")
            filter.each do |f|
                assign_homework.each do |hw|
                    arr_data[hw.tag_name] ||= {}
                    arr_data[hw.tag_name][f] ||= 0
                    arr_data[hw.tag_name]["total_daily"] = 0
                    arr_data[hw.tag_name]["total_weekly"] = 0
                    if f == "ส่งการบ้านรายวัน" && hw.status == "checked" && hw.homework_type_id == 1
                        arr_data[hw.tag_name]["total_daily"] += 1
                        arr_data[hw.tag_name]["ส่งการบ้านรายวัน"] += frequency_daily_score(((hw.estimate_date - hw.send_date)/3600).round)
                    end
                    if f == "ส่งการบ้านรายสัปดาห์" && hw.status == "checked" && hw.homework_type_id == 2
                        arr_data[hw.tag_name]["total_weekly"] += 1
                        arr_data[hw.tag_name]["ส่งการบ้านรายสัปดาห์"] += frequency_weekly_score(((hw.estimate_date - hw.send_date)).round)
                    end
                end

                if f == "สมาธิ" || f == "พัฒนาการ"
                    development.each do |dev|
                        arr_data[dev.tag_name][f] ||= 0
                        # json = JSON.parse(dev.development)
                        json = dev.development
                        json.each do |k, v|
                            arr_data[dev.tag_name]["สมาธิ"] += v["meditate"].to_i if f == "สมาธิ"
                            arr_data[dev.tag_name]["พัฒนาการ"] += v["development"].to_i if f == "พัฒนาการ"
                        end
                    end
                end
            end
        end

        data = Hash.new
        @all = 0
        arr_data.each { |k,v|
            name = v.keys
            name.each do |n|
                next if n.include?("total")
                data[n] ||= []
                if n == "ส่งการบ้านรายวัน" && v["total_daily"] != 0
                    calulate = (v[n]/v["total_daily"]).round(2)
                elsif n == "ส่งการบ้านรายสัปดาห์" && v["total_weekly"] != 0
                    calulate = (v[n]/v["total_weekly"]).round(2)
                else
                    calulate = v[n]
                end
                @all += calulate
                data[n] << [k, calulate]
            end
        }
        data.to_a.each{ |d| graph << {name: d[0], data: d[1]}}
        return graph
    end

    def frequency_daily_score hours
        if hours > 0
            return score = 10
        elsif hours < 0 && hours > -2
            return score = 9
        elsif hours < -2 && hours > -4
            return score = 8
        elsif hours < -4 && hours > -6
            return score = 7
        elsif hours < -6 && hours > -8
            return score = 6
        elsif hours < -8 && hours > -10
            return score = 5
        elsif hours < -10 && hours > -12
            return score = 4
        elsif hours < -12 && hours > -16
            return score = 3
        elsif hours < -16 && hours > -20
            return score = 2
        elsif hours < -20 && hours > -24
            return score = 1
        else
            return score = 0
        end
    end

    def frequency_weekly_score days
        if days > 0
            return score = 10
        elsif days < 0 && days > -1
            return score = 9
        elsif days < -1 && days > -2
            return score = 8
        elsif days < -2 && days > -3
            return score = 7
        elsif days < -3 && days > -4
            return score = 6
        elsif days < -4 && days > -5
            return score = 5
        elsif days < -5 && days > -6
            return score = 4
        elsif days < -6 && days > -7
            return score = 2
        else
            return score = 0
        end
    end
end

module DashboardHelper
    def get_all_done data, num_category
        count = 0
        for i in 1..num_category
            count += data["category_#{i}"]["done"].to_i if data["category_#{i}"].present?
        end
        return count
    end

    def get_all_remain data, num_category
        count = 0
        for i in 1..num_category
            count += data["category_#{i}"]["remain"].to_i if data["category_#{i}"].present?
        end
        return count
    end

    def percent_done data, num_category
        total_done = get_all_done(data, num_category)
        total_remain = get_all_remain(data, num_category)
        total_task = total_done + total_remain
        return total_task == 0 ? 0 : (( (total_done.to_f/total_task.to_f).round(2) ) * 100).round
    end

    def get_done_task data, category_id
        return data["category_#{category_id}"].present? ? data["category_#{category_id}"]["done"].to_i : 0
    end

    def get_remain_task data, category_id
        return data["category_#{category_id}"].present? ? data["category_#{category_id}"]["remain"].to_i : 0
    end

    def percent_done_each_category data, category_id
        total_done = get_done_task(data, category_id)
        total_remain = get_remain_task(data, category_id)
        total_task = total_done + total_remain
        return total_task == 0 ? 0 : (( (total_done.to_f/total_task.to_f).round(2) ) * 100).round
    end

    def get_all_overdue data, num_category
        count = 0
        for i in 1..num_category
            count += data["category_#{i}"]["estimated"].to_i if data["category_#{i}"].present?
        end
        return count
    end

    def get_overdue_day data, num_category
        count = 0
        for i in 1..num_category
            count += data["category_#{i}"]["day"].to_i if data["category_#{i}"].present?
        end
        return count
    end

    def get_overdue_week data, num_category
        count = 0
        for i in 1..num_category
            count += data["category_#{i}"]["week"].to_i if data["category_#{i}"].present?
        end
        return count
    end

    def get_overdue_day_each_cat data
        return data["specific_category"]["day"].present? ? data["specific_category"]["day"].to_i : 0
    end

    def get_overdue_week_each_cat data
        return data["specific_category"]["week"].present? ? data["specific_category"]["week"].to_i : 0
    end

    def get_score_data data, category
        result = []
        category.each do |k, v|
            total_done = get_done_task(data, k)
            total_remain = get_remain_task(data, k)
            total_task = total_done + total_remain
            score = data["category_#{k}"].present? ? (data["category_#{k}"]["score"].to_f/total_task.to_f).round(2) : 0
            result << [v["name_en"], score]
        end
        return result
    end

    def can_access_action?
        return redirect_to path_to_root unless session["permission_roles"].include?(1)
    end

    def exam_date
        ["1 Day", "2 Day", "3 Day", "4 Day", "5 Day", "6 Day", "1 Week", "2 Week", "3 Week", "1 Month", "More than 1 month"]
    end

    def study_class
        ["ประถมศึกษา", "มัธยมศึกษาปีที่ 1", "มัธยมศึกษาปีที่ 2", "มัธยมศึกษาปีที่ 3", "มัธยมศึกษาปีที่ 4", "มัธยมศึกษาปีที่ 5", "มัธยมศึกษาปีที่ 6", "ปริญญาตรี", "มากกว่าปริญาตรี", "อื่นๆ"]
    end
end

module ParticipationHelper
    require "json"

    def summary_data participate
        data = Hash.new
        data["rows"] = []
        participate.each do |pt|
            count_participation = 0
            count_late = 0
            count_not_participation = 0
            person = []
            unless pt.participation.blank?
                json = JSON.parse(pt.participation)
                json.each do |k, v|
                    count_participation += v["participate"]
                    count_late += v["late"]
                    count_not_participation += v["not_participate"]
                end
            end
            person << "#{pt.firstname} #{pt.lastname}"
            person << get_image(pt.profile_pic, pt.firstname, pt.lastname, "subject", count_participation, count_late, count_not_participation)
            person << count_participation
            person << count_late
            person << count_not_participation
            data["rows"] << person
        end

        data.to_json
    end

    def get_image picture, firstname, lastname, type, participate, late, not_participate
        picture_path = picture.attached? ? url_for(picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        txt_participate = type == "event" ? "เข้าร่วม" : "มา"
        txt_not_particapate = type == "event" ? "ไม่เข้าร่วม" : "ไม่มา"
        tooltip = "<div style=\"padding:15px;\">" +
            "<img src=\"#{picture_path}\" class=\"border rounded-circle mb-3\" style=\"width:100px; height:100px\"><br/>" +
            "<p>#{firstname} #{lastname}</p>" +
            "<table class=\"information\">" +
            participate_icon(participate, txt_participate) +
            late_icon(late) +
            not_participate_icon(not_participate, txt_not_particapate) +
            "</table>" + "</div>"
        tooltip
    end

    def participate_icon participate, text
        participation = "<tr>" +
            "<td><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-person-check-fill tooltip-participate me-2\" viewBox=\"0 0 16 16\">"+
            "<path fill-rule=\"evenodd\" d=\"M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0\"/>"+
            "<path d=\"M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"/>"+
            "</svg>#{text}</td>" +
            "<td><span class=\"tooltip-participate ps-2\"><b>#{participate}</b></span></td>" + "</tr>"
        return participation
    end

    def late_icon late
        if late.blank?
            return ""
        else
            lated = "<tr>" +
                "<td><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-person-dash-fill tooltip-late me-2\" viewBox=\"0 0 16 16\">"+
                "<path fill-rule=\"evenodd\" d=\"M11 7.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5\"/>"+
                "<path d=\"M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"/>"+
                "</svg>มาสาย</td>" +
                "<td><span class=\"tooltip-late ps-2\"><b>#{late}</b></span></td>" + "</tr>"
            return lated
        end
    end

    def not_participate_icon not_participate, text
        not_participation = "<tr>" +
            "<td><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-person-x-fill tooltip-not-participate me-2\" viewBox=\"0 0 16 16\">"+
            "<path fill-rule=\"evenodd\" d=\"M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708\"/>"+
            "</svg>#{text}</td>" +
            "<td><span class=\"tooltip-not-participate ps-2\"><b>#{not_participate}</b></span></td>" + "</tr>"
        return not_participation
    end

    def summary_concert participate
        data = Hash.new
        data["rows"] = []
        
        participate.each do |pt|
            count_participation = 0
            count_not_participation = 0
            event = []
            unless pt.participation.blank?
                json = JSON.parse(pt.participation)
                json.each do |k, v|
                    count_participation += v["participate"]
                    count_not_participation += v["not_participate"]
                end
            end
            event << "#{pt.firstname} #{pt.lastname}"
            event << get_image(pt.profile_pic, pt.firstname, pt.lastname, "event", count_participation, "", count_not_participation)
            event << count_participation
            event << count_not_participation
            data["rows"] << event
        end

        data.to_json
    end

    def get_check_permission type
        arr_permission = case type
                         when "event" then [18, 21, 22]
                         else [18, 21, 22]
                         end
        return arr_permission
    end

    def get_add_user_permission type
        arr_permission = case type
                         when "event" then [20, 21]
                         else [20, 21]
                         end
        return arr_permission
    end

    def checked_participate json, date
        participate = false
        if json.present?
            json_data = json.instance_of?(String) ? JSON.parse(json) : json
            participate = true if json_data.dig(date, "participate").to_i > 0
        end 
        participate
    end

    def checked_late json, date
        participate = false
        if json.present?
            json_data = json.instance_of?(String) ? JSON.parse(json) : json
            participate = true if json_data.dig(date, "late").to_i > 0
        end 
        participate
    end

    def checked_not_participate json, date
        participate = true
        # if json.present?
        #     json_data = json.instance_of?(String) ? JSON.parse(json) : json
        #     participate = true if json_data.dig(date, "not_participate").to_i > 0
        # end 
        if checked_participate(json, date) || checked_late(json, date)
            participate = false
        end
        participate
    end

    def get_display_class classname, room
        if classname.include?("มัธยมศึกษา")
            c, m = classname.split(" "); 
            text = "ม.#{m} ห้อง #{room}"
        else
            text = "#{classname} ห้อง #{room}"
        end
        text
    end
    
    def study_class
        arr_class = []
        arr_class << ["ประถมศึกษาปีที่ 1", "ประถมศึกษาปีที่ 2", "ประถมศึกษาปีที่ 3", "ประถมศึกษาปีที่ 4", "ประถมศึกษาปีที่ 5", "ประถมศึกษาปีที่ 6"]
        arr_class << ["EP 1", "EP 2", "EP 3", "EP 4", "EP 5", "EP 6"]
        arr_class << ["CEP 1", "CEP 2", "CEP 3", "CEP 4", "CEP 5", "CEP 6"]
        arr_class << "อื่นๆ"
        arr_class.flatten
    end

    def room
        number = (1..20).to_a
    end

    def study_class_and_room
        arr_class_and_room = []
        arr_class = study_class()
        arr_room = room()
        arr_class.each do |c|
            next if c == "อื่นๆ"
            arr_room.each {|r| arr_class_and_room << ["#{c}/#{r}", "#{c}_#{r}"]}
        end
        arr_class_and_room
    end
end

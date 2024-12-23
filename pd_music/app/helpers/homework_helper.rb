module HomeworkHelper
    def get_status
        return [["Open", "open"], ["Send", "send"], ["Reject", "reject"], ["Checked", "checked"]]
    end

    def deadline_date
        [["1 Day", "1"], ["2 Day", "2"], ["3 Day", "3"], ["4 Day", "4"], ["5 Day", "5"], ["6 Day", "6"], ["1 Week", "7"], ["2 Week", "14"], ["3 Week", "21"], ["1 Month", "30"]]
    end
end
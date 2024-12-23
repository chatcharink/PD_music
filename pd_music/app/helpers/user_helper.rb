module UserHelper
    def study_class
        arr_class = []
        arr_class << ["ประถมศึกษาปีที่ 1", "ประถมศึกษาปีที่ 2", "ประถมศึกษาปีที่ 3", "ประถมศึกษาปีที่ 4", "ประถมศึกษาปีที่ 5", "ประถมศึกษาปีที่ 6"]
        arr_class << ["EP 1", "EP 2", "EP 3", "EP 4", "EP 5", "EP 6"]
        arr_class << ["CEP 1", "CEP 2", "CEP 3", "CEP 4", "CEP 5", "CEP 6"]
        arr_class << "อื่นๆ"
        arr_class.flatten
    end
end

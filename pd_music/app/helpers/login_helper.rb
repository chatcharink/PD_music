module LoginHelper
    def study_class
        arr_class = []
        arr_class << ["ประถมศึกษาปีที่ 1", "ประถมศึกษาปีที่ 2", "ประถมศึกษาปีที่ 3", "ประถมศึกษาปีที่ 4", "ประถมศึกษาปีที่ 5", "ประถมศึกษาปีที่ 6"]
        arr_class << ["EP 1", "EP 2", "EP 3", "EP 4", "EP 5", "EP 6"]
        arr_class << ["CEP 1", "CEP 2", "CEP 3", "CEP 4", "CEP 5", "CEP 6"]
        arr_class << "อื่นๆ"
        arr_class.flatten
    end

    def get_relation
        ["พ่อ", "แม่", "พี่", "ลุง", "ป้า", "น้า", "อา", "ปู่", "ย่า", "ตา", "ยาย", "ทวด"]
    end

    def province_th
        [
            "กรุงเทพฯ",
            "กระบี่",
            "กาญจนบุรี",
            "กาฬสินธุ์",
            "กำแพงเพชร",
            "ขอนแก่น",
            "จันทบุรี",
            "ฉะเชิงเทรา",
            "ชลบุรี",
            "ชัยนาท",
            "ชัยภูมิ",
            "ชุมพร",
            "เชียงใหม่",
            "เชียงราย",
            "ตรัง",
            "ตราด",
            "ตาก",
            "นครนายก",
            "นครปฐม",
            "นครพนม",
            "นครราชสีมา",
            "นครศรีธรรมราช",
            "นครสวรรค์",
            "นนทบุรี",
            "นราธิวาส",
            "น่าน",
            "บึงกาฬ",
            "บุรีรัมย์",
            "ปทุมธานี",
            "ประจวบคีรีขันธ์",
            "ปราจีนบุรี",
            "ปัตตานี",
            "พระนครศรีอยุธยา",
            "พะเยา",
            "พังงา",
            "พัทลุง",
            "พิจิตร",
            "พิษณุโลก",
            "เพชรบุรี",
            "เพชรบูรณ์",
            "แพร่",
            "ภูเก็ต",
            "มหาสารคาม",
            "มุกดาหาร",
            "แม่ฮ่องสอน",
            "ยโสธร",
            "ยะลา",
            "ร้อยเอ็ด",
            "ระนอง",
            "ระยอง",
            "ราชบุรี",
            "ลพบุรี",
            "ลำปาง",
            "ลำพูน",
            "เลย",
            "ศรีสะเกษ",
            "สกลนคร",
            "สงขลา",
            "สตูล",
            "สมุทรปราการ",
            "สมุทรสงคราม",
            "สมุทรสาคร",
            "สระแก้ว",
            "สระบุรี",
            "สิงห์บุรี",
            "สุโขทัย",
            "สุพรรณบุรี",
            "สุราษฎร์ธานี",
            "สุรินทร์",
            "หนองคาย",
            "หนองบัวลำภู",
            "อ่างทอง",
            "อำนาจเจริญ",
            "อุดรธานี",
            "อุตรดิตถ์",
            "อุทัยธานี",
            "อุบลราชธานี",
        ]
    end
end

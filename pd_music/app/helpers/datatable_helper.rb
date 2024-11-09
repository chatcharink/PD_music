module DatatableHelper
    def profile_path picture
        pic = picture.attached? ? url_for(picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        pic
    end
end
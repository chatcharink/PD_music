class UserDatatable < ApplicationDatatable
  def_delegators :@view, :edit_user_path, :user_path, :user_list_approved_path, :session, :can_view_menu?

  def initialize(params, opts = {})
    @view = opts[:view_context]
    super
  end

  def view_columns
    # Declare strings in this format: ModelName.column_name
    # or in aliased_join_table.column_name format
    @view_columns ||= {
      picture: { source: "User.id", cond: :eq },
      name: { source: "User.firstname", cond: :like },
      class: { source: "User.study_class", cond: :eq},
      room: { source: "User.room", cond: :like },
      status: { source: "User.status", cond: :like },
      role: { source: "User.role", cond: :like },
      action: { source: "", cond: :like }
    }
  end

  def data
    records.map do |record|
      {
        picture: get_profile_pic(record.profile_pic), #record.profile_pic, #"<img src='#{@view.url_for(record.profile_pic)}'> class='rounded-circle border' width='30px' height='30px'".html_safe, # get_profile_pic(record.profile_pic),
        name: get_name(record.firstname, record.lastname),
        class: record.study_class,
        room: get_room_no(record.room, record.student_no),
        status: get_status(record.status),
        role: record.role_name,
        action: user_action(record)
      }
    end
  end

  def get_raw_records
    # insert query here
    user = User.select("roles.role_name, users.*")
    user = user.joins("left join roles on roles.id = users.role")
    user = user.where("users.role > ?", session["current_user"]["role"]) if session["current_user"]["role"] != 1
    user = user.where("users.firstname like ? or users.lastname like ?", "%#{params["user_name"]}%", "%#{params["user_name"]}%") if params["user_name"].present?
    user = user.where("users.status = ?", params["status"]) if params["status"].present?
    user = user.order(Arel.sql(%q(
                      case users.status
                      when 'inactive' then 1
                      when 'active'  then 2
                      when 'deleted'  then 3
                      end
                    )))
    @role = Role.all
    user

  end

  def get_profile_pic picture
    # thumbnail = '<%= image_tag(picture.attached? ? picture : "/pictures/logo.png") %>'
    picture_path = picture.attached? ? url_for(picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
    thumbnail = "<img src='#{picture_path}' class='rounded-circle border' width='75px' height='75px' />"
    thumbnail.html_safe
  end

  def get_name firstname, lastname
    "#{firstname.capitalize} #{lastname}"
  end

  def get_room_no room, no
    "#{room}/#{no}"
  end

  def get_age(age)
    age_txt = ""
    if age.present?
      year, month = age.split("_")
      age_txt = "#{year} ปี #{month} เดือน"
    end
    age_txt
  end

  def musical_instrument(id, others)
    if id == 14
      return " - #{others}"
    end
  end

  def get_status status
    arr_status = []
    if status == "deleted"
      arr_status << "<span>#{status.capitalize}</span>"
    else
      arr_status << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-circle-fill user-#{status}-icon\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"8\"/><span class=\"ms-3\">#{status.capitalize}</span></svg>"
    end
    
    arr_status.join(" ").html_safe
  end

  def user_action(record)
    actions = []
    if can_view_menu?([6]) || can_view_menu?([7]) || can_view_menu?([8])
      actions << "<div class=\"dropdown\">"
      actions << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" data-bs-auto-close=\"outside\" class=\"bi bi-three-dots-vertical\" data-bs-toggle=\"dropdown\" id=\"action-menu-#{record.id}\" aria-expanded=\"false\" viewBox=\"0 0 16 16\"><path d=\"M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0\"/></svg>"
      actions << "<span class=\"position-absolute top-0 start-75 translate-middle p-1 bg-danger border border-light rounded-circle\"><span class=\"visually-hidden\">New alerts</span></span>" if record.status == "inactive"
      actions << "<ul class=\"dropdown-menu\" aria-labelledby=\"action-menu-#{record.id}\">"
      if record.status == "inactive" && can_view_menu?([6])
        actions << "<li class=\"approve-user\"><div class=\"btn-group dropstart w-100\">"
        actions << "<button type=\"button\" class=\"btn text-start\" data-bs-toggle=\"dropdown\"  id=\"approve-menu-#{record.id}\" aria-expanded=\"false\">Approve</button>"
        actions << "<ul class=\"dropdown-menu\" aria-labelledby=\"approve-menu-#{record.id}\">"
        @role.each { |r| actions << "#{link_to("#{r.role_name}", user_list_approved_path(id: record.id, role: r.id), class: "dropdown-item", data: {turbo_method: :post})}"}
        actions << "</ul></div></li>"
      end
      if can_view_menu?([7])
        actions << "<li>#{link_to("Edit", edit_user_path(id: record.id), class: "dropdown-item")}</li>"
      end
      
      if can_view_menu?([8])
        actions << "<li><button type=\"button\" class=\"dropdown-item\" data-bs-toggle=\"modal\" data-bs-target=\"#deleteUserModal\" data-action=\"click->user#setDeleteId\" data-user-id-param=\"#{record.id}\" data-user-name-param=\"#{record.firstname} #{record.lastname}\">Delete</button></li>"
      end
      actions << '</ul></div>'
    end
    actions.join(' ').html_safe
  end
end

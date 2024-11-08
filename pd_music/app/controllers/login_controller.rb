class LoginController < ApplicationController
    require "date"
    require "openssl"
    include LoginHelper

    def index
        return redirect_to path_to_root if session["current_user"].present?
    end

    def authenicate
        username = params["form_login"]["username"].strip
        password = params["form_login"]["password"]
        @user = User.where(:username => username).limit(1).or(User.where(:email => username).limit(1))
        if @user.present?
            @user.each do |u|
                if u.status != "active"
                    if u.status == "inactive"
                        flash[:error] = "Your account is not activate. Please try again later."
                        save_activity("Login", "Fail", "Login with invalid account")
                    else
                        flash[:error] = "Username not found. Please register and try again later."
                        save_activity("Login", "Fail", "Username not found")
                    end
                    
                    return redirect_to login_path()
                    break
                end
                ecrypt_password = BCrypt::Engine.hash_secret(password, u.salt_password)
                if u.password == ecrypt_password
                    user_info = u
                    user_info["profile_pic"] = u.profile_pic.present? ? url_for(u.profile_pic) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
                    permission_role = PermissionAndRole.where(role_id: u.role)
                    # user_info["permission_roles"] = permission_role.pluck(:permission_id)
                    session["current_user"] = user_info
                    session["permission_roles"] = permission_role.pluck(:permission_id)
                    session["inactive_user"] = User.where(status: "inactive").count if can_view_menu?([6])
                    User.update(u.id, first_login: 1)
                    flash[:success] = "Login Successfully. Welcome #{u.firstname} to PD music school." if can_view_menu?([1]) || can_view_menu?([14]) || can_view_menu?([20]) || can_view_menu?([28])
                    save_activity("Login", "Success", "#{u.username} login success")
                    redirect_to path_to_root
                else
                    flash[:error] = "Your password was wrong. Please try again."
                    save_activity("Login", "Fail", "Login with wrong password")
                    redirect_to login_path(:username => username)
                end
                break
            end
        else
            flash[:error] = "Your username or email not found. Please register and try again later."
            save_activity("Login", "Fail", "Login with invalid username or email")
            redirect_to login_path()
        end
    end

    def signup
        @province = province_th()
    end

    def register
        state = params["signup_state"]
        case state
        when "1"
            # check duplicate username
            username = params["form_login"]["username"].strip
            password = params["form_login"]["password"]
            find_user = User.where(username: username).where.not(status: "deleted").first
            if find_user.blank?
                generated_salt_password = BCrypt::Engine.generate_salt
                ecrypt_password = BCrypt::Engine.hash_secret(password, generated_salt_password)
                token = ecrypt_password+username+generated_salt_password
                session[token] = {}
                session[token]["username"] = username
                session[token]["password"] = ecrypt_password
                session[token]["salt_password"] = generated_salt_password
                musical = MusicalInstrument.where(status: "active")
                musical_instruments = musical.pluck(:musical_instruments_th, :id)
                class_study = study_class()
                render(
                    partial: 'login/form_user_info',
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {token: token, musical_instruments: musical_instruments, class_study: class_study})
                # render partial: "login/form_user_info", format: :html
            else
                respond_to do |format|
                    format.json { render :json => {error: "duplicate"} }
                end
            end
        when "2"
            token = params["token"]
            find_user = User.where(email: params["form_login"]["email"].strip).where.not(status: "deleted").first
            if find_user.blank?
                age = "#{params["form_login"]["year"]}_#{params["form_login"]["month"]}"
                session[token]["firstname"] = params["form_login"]["firstname"]
                session[token]["lastname"] = params["form_login"]["lastname"]
                session[token]["dob"] = params["form_login"]["dob"]
                session[token]["age"] = age
                session[token]["study_year"] = params["form_login"]["study_year"]
                session[token]["others_study_year"] = params["form_login"]["other_study_year"]
                session[token]["musical_instrument"] = params["form_login"]["musical_instrument"]
                session[token]["others_musical_instrument"] = params["form_login"]["other_musical_instrument"]
                session[token]["room"] = params["form_login"]["room"]
                session[token]["student_no"] = params["form_login"]["student_no"]
                session[token]["email"] = params["form_login"]["email"].strip
                session[token]["phone_number"] = params["form_login"]["phone_number"]
                relation = get_relation()
                province = province_th()
                render(
                    partial: 'login/form_parent_info',
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {token: token, relation: relation, province: province})
            else
                respond_to do |format|
                    format.json { render :json => {error: "duplicate"} }
                end
            end
        when "3"
            token = params["token"]
            email = session[token]["email"]
            session[token]["parent_firstname"] = params["form_login"]["firstname"]
            session[token]["parent_lastname"] = params["form_login"]["lastname"]
            session[token]["parent_phone_number"] = params["form_login"]["phone_number"]
            session[token]["parent_relation"] = params["form_login"]["relation"]
            begin
                User.signup(session[token])
                save_activity("Registration", "Success", "#{session[token]["username"]} register to PD music successfully")
                session.delete token
                render(
                    partial: 'login/form_signup_success',
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {email: email})
            rescue => exception
                flash[:error] = "Something went wrong. Please contact to support team."
                respond_to do |format|
                    format.json { render :json => {error: "db error"} }
                end
            end
        end

        # render partial: "login/form_user_info", format: :html
    end

    def logout
        if params["state"]
            flash[:success] = "Force logout because of you session was expired."
            save_activity("Logout", "Success", "Force logout because of you session was expired")
        else
            flash[:success] = "Log out successfully. See you soon"
            save_activity("Logout", "Success", "Log out successfully")
        end
        session.delete "current_user"
        session.delete "permission_roles"
        session.delete "inactive_user"
        redirect_to login_path()
    end

    def forgot_password
        render(
            partial: 'login/forgot_password',
            formats: [:html, :js, :json, :url_encoded_form])
    end

    def reset_password
        user = User.find_by(email: params["form_forgot_password"]["email"])
        unless user.blank?
            date = DateTime.now()+1
            
            token = SecureRandom.base36(24) + encrypt(date.strftime("%Y%m%d%H%M%S")) + user.salt_password
            UserMailer.reset_password(user, token).deliver_now
            flash[:success] = "Send email to reset your password succussfully."
            respond_to do |format|
                format.json { render :json => {state: "success"} }
            end 
            # redirect_to login_path()
        else
            respond_to do |format|
                format.json { render :json => {state: "error", message: "Email address not found."} }
            end 
        end
    end

    def new_password
        begin
            date_now = DateTime.now()
            decrypt_date = decrypt(params["token"][24..37])
            token_expired = DateTime.parse(decrypt_date)

            user = User.find_by(salt_password: params["token"][38..-1])
            @user = user.username
            @id = user.id

            if (token_expired - date_now).to_i <= 0
                flash[:error] = "Token already expired. Please reset password again."
                save_activity("Reset password", "Fail", "Cannot reset password because token already expired")
                redirect_to login_path()
            end
        rescue => e
            flash[:error] = "Something was wrong. Please reset password again."
            save_activity("Reset password", "Fail", "Reset password fail")
            redirect_to login_path()
        end
    end

    def change_password
        user_id = params["form_change_password"]["user_id"]
        password = params["form_change_password"]["password"]
        generated_salt_password = BCrypt::Engine.generate_salt
        encrypt_password = BCrypt::Engine.hash_secret(password, generated_salt_password)
        begin
            User.update_password(user_id, generated_salt_password, encrypt_password)
            flash[:success] = "Change password succussfully. Please login to PD music again."
            save_activity("Reset password", "Success", "Reset password successfully")
            redirect_to login_path()
        rescue => e
            flash[:error] = "Something went wrong. Please contact to support team."
            save_activity("Reset password", "Fail", "Reset password fail")
            redirect_to login_path()
        end
    end

    private

    def encrypt date
        key = ("a".."z").to_a
        str = []
        date.split("").each do |d|
            str << key[d.to_i]
        end

        str.join("")
    end

    def decrypt data
        key = ("a".."z").to_a
        str = []
        data.split("").each do |d|
            str << key.index(d)
        end

        str.join("")
    end
end

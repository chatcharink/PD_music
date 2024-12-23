Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "dashboard#index"
  get "login", to: "login#index"
  post "login/authenicate", to: "login#authenicate"
  get "login/signup", to: "login#signup"
  post "login/register", to: "login#register"
  get "login/logout", to: "login#logout"
  get "login/forgot_password", to: "login#forgot_password"
  post "login/reset_password", to: "login#reset_password"
  get "login/reset", to: "login#new_password"
  post "login/change_password", to: "login#change_password"

  post "dashboard/filter", to: "dashboard#filter_report"
  get "dashboard/datatable", to: "dashboard#dashboard_datatable"
  post "dashboard/change_tab", to: "dashboard#change_tab"
  post "dashboard/comment", to: "dashboard#add_comment"
  post "dashboard/view_user_comment", to: "dashboard#view_user_comment"
  post "dashboard/update_status", to: "dashboard#update_status"
  post "dashboard/add_exam_date", to: "dashboard#add_exam_date"

  get "report", to: "report#index"
  get "report/filter_user_or_subject", to: "report#filter_user_or_subject"
  get "report/filter_category", to: "report#filter_category"
  get "report/filter_homework", to: "report#filter_homework"
  get "report/filter_graph", to: "report#filter_graph"

  resources :homework
  post "homework/do/create_question", to: "homework#create_question"
  get "homework/do/detail_datatable", to: "homework#detail_datatable"
  get "homework/do/detail_score_datatable", to: "homework#get_detail_score"
  get "homework/do/datatable", to: "homework#datatable"
  get "homework/do/homework", to: "homework#do_homework"
  post "homework/do/set_audio", to: "homework#set_audio"
  post "homework/do/update_status", to: "homework#update_status"
  get "homework/do/reveal_answer", to: "homework#get_reveal_answer"
  post "homework/do/next_question", to: "homework#get_next_question"
  get "homework/do/review_homework", to: "homework#review_homework"
  post "homework/do/give_homework_score", to: "homework#give_score"
  post "homework/do/reject_homework", to: "homework#reject_homework"
  get "homework/subject/list", to: "homework#subject_list" 
  post "homework/create_tag", to: "homework#create_tag"
  get "homework/show/get_improvement_detail", to: "homework#get_improvement"
  post "homework/add_improvement", to: "homework#add_improvement"
  get "homework/show/homework_table", to: "homework#show_homework_table"
  delete "homework/show/delete_homework", to: "homework#delete_homework"
  post "homework/add_type", to: "homework#add_homework_type"
  post "homework/answer_format", to: "homework#select_answer_format"
  post "homework/add/question", to: "homework#add_questions"
  post "homework/add_choice", to: "homework#add_choices"
  get "homework/subject/get_user", to: "homework#get_user_homework_mapping"
  post "homework/add_user", to: "homework#add_user_to_homework"

  resources :participation
  post "participation/filter_report", to: "participation#filter"
  post "participation/add_subject", to: "participation#add_subject"
  post "participation/add_event", to: "participation#add_event"
  post "participation/add_user", to: "participation#add_user_to_subject"
  get "participation/subject/get_user", to: "participation#get_participate_of_user"
  post "participation/filter_subject", to: "participation#search_subject"

  resources :user
  get "user/datatable", to: "user#datatable"
  post "user/upload_profile_picture", to: "user#upload_profile_picture"
  post "user/list/approved", to: "user#approve_user"

  get "settings/notification", to: "notification#index"
  post "settings/save_notification", to: "notification#save_notification_setting"
  post "notification/filter", to: "notification#filter"
  post "notification/update", to: "notification#update_noti"
  
  get "settings/permission", to: "permission#index"
  post "settings/update_permission", to: "permission#update_permission"

  get "food", to: "food#index"
  post "food/set_order_rule", to: "food#setting_order"
  post "food/export_order", to: "food#export_order"
  get "food/filter_date", to: "food#filter_date"
  post "food/add_coupon", to: "food#add_coupon"
  get "food/restaurants", to: "food#restaurant"
  delete "food/restaurants", to: "food#destroy"
  post "food/restaurants/update_status", to: "food#update_restaurant_status"
  post "food/create", to: "food#create"
  get "food/menu", to: "food#menu_list"
  get "food/menu/datatable", to: "food#menu_datatable"
  post "food/menu/create", to: "food#create_menu"
  post "food/menu/option_create", to: "food#create_option"
  get "food/menu/get_option", to: "food#get_option"
  get "food/menu/get_menu", to: "food#get_menu"
  post "food/menu/update_status", to: "food#update_status"
  get "food/order", to: "food#order"
  delete "food/order", to: "food#destroy_order"
  get "food/order/get_menu", to: "food#get_menu_order"
  post "food/order/confirm", to: "food#confirm_order"
  get "food/order/change_date", to: "food#change_date"

  get "contact_us", to: "contact_us#index"

  get "activity_log", to: "activity_log#index"
  get "activity_log/datatable", to: "activity_log#datatable"

  get "category/show/datatable", to: "category#datatable"
  resources :category

  get "homework_type/show/datatable", to: "homework_type#datatable"
  resources :homework_type
end

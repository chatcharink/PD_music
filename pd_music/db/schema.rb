# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2024_10_24_181255) do
  create_table "action_text_rich_texts", charset: "utf8", force: :cascade do |t|
    t.string "name", null: false
    t.text "body", size: :long
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", charset: "utf8", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activity_logs", charset: "utf8", force: :cascade do |t|
    t.bigint "user_id", unsigned: true
    t.bigint "user_role_id", unsigned: true
    t.string "device"
    t.string "detected_ip", limit: 20
    t.string "action_name", limit: 150
    t.string "action_result", limit: 50
    t.string "component", limit: 150
    t.text "action_detail"
    t.datetime "action_datetime"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "categories", charset: "utf8", force: :cascade do |t|
    t.string "name_th", limit: 150
    t.string "name_en", limit: 150
    t.string "color_code", limit: 20
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "comments", charset: "utf8", force: :cascade do |t|
    t.string "subject", limit: 150
    t.text "comment"
    t.integer "rating", limit: 2
    t.bigint "student_id"
    t.bigint "comment_by"
    t.string "comment_type", limit: 50
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status"
  end

  create_table "events", charset: "utf8", force: :cascade do |t|
    t.string "event_name", limit: 250
    t.text "description"
    t.date "event_date"
    t.column "status", "enum('active','inactive','deleted')", default: "active"
    t.bigint "created_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "homework_types", charset: "utf8", force: :cascade do |t|
    t.string "homework_type", limit: 250
    t.text "description"
    t.column "status", "enum('active','deleted')", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "homework_user_mappings", charset: "utf8", force: :cascade do |t|
    t.bigint "homework_id"
    t.bigint "user_id"
    t.column "status", "enum('open','send','reject','checked')", default: "open"
    t.bigint "score"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "send_date"
  end

  create_table "homeworks", charset: "utf8", force: :cascade do |t|
    t.string "task_name", limit: 250
    t.bigint "category_id"
    t.bigint "question_id"
    t.column "status", "enum('active','inactive','deleted')", default: "active"
    t.datetime "estimate_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "full_score"
    t.bigint "subject_id"
    t.integer "is_default", limit: 2
    t.bigint "priority"
    t.bigint "homework_type_id"
  end

  create_table "menus", charset: "utf8", force: :cascade do |t|
    t.string "menu_name"
    t.text "menu_picture"
    t.text "description"
    t.bigint "restaurant_id"
    t.integer "price"
    t.column "menu_type", "enum('main','option')", default: "main"
    t.json "option_menu"
    t.string "option_category", limit: 250
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "set_second_dish"
    t.column "status", "enum('active','inactive','deleted')", default: "active"
  end

  create_table "musical_instruments", charset: "utf8", force: :cascade do |t|
    t.string "musical_instruments_th", limit: 150
    t.string "musical_instruments_en", limit: 150
    t.text "description"
    t.column "status", "enum('active','deleted')", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "notifications", charset: "utf8", force: :cascade do |t|
    t.string "subject"
    t.text "message"
    t.integer "status", limit: 2
    t.bigint "send_by"
    t.bigint "user_id"
    t.string "notification_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "orders", charset: "utf8", force: :cascade do |t|
    t.bigint "menu_id"
    t.bigint "user_id"
    t.datetime "date"
    t.json "optional"
    t.bigint "has_second_order"
    t.bigint "second_menu_id"
    t.integer "total_price"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "meal", limit: 150
    t.text "more_detail"
  end

  create_table "participations", charset: "utf8", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "subject_id"
    t.json "participation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "participate_type", limit: 50
  end

  create_table "permission_and_roles", charset: "utf8", force: :cascade do |t|
    t.bigint "role_id"
    t.bigint "permission_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "permissions", charset: "utf8", force: :cascade do |t|
    t.string "controller_name"
    t.string "action"
    t.string "function_name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "priority"
  end

  create_table "questions", charset: "utf8", force: :cascade do |t|
    t.bigint "question_no"
    t.text "question"
    t.text "question_media"
    t.bigint "answer_format"
    t.text "chords"
    t.bigint "choice_no"
    t.text "answer"
    t.string "correct_answer"
    t.integer "option", limit: 2
    t.text "reveal"
    t.bigint "homework_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "restaurants", charset: "utf8", force: :cascade do |t|
    t.string "restaurant_name"
    t.text "restaurant_picture"
    t.bigint "restaurant_category"
    t.column "status", "enum('active','inactive','deleted')", default: "active"
    t.string "telephone_no", limit: 20
    t.string "line_id", limit: 50
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "roles", charset: "utf8", force: :cascade do |t|
    t.string "role_name", limit: 150
    t.string "description", limit: 250
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sessions", charset: "utf8", force: :cascade do |t|
    t.string "session_id", null: false
    t.text "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
    t.index ["updated_at"], name: "index_sessions_on_updated_at"
  end

  create_table "subjects", charset: "utf8", force: :cascade do |t|
    t.string "subject_name", limit: 250
    t.text "description"
    t.column "status", "enum('active','inactive','deleted')", default: "active"
    t.bigint "created_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "subject_type", limit: 50
    t.integer "class_periods"
  end

  create_table "users", charset: "utf8", force: :cascade do |t|
    t.string "username", limit: 250
    t.string "salt_password", limit: 250
    t.string "password", limit: 250
    t.string "firstname", limit: 250
    t.string "lastname", limit: 250
    t.datetime "date_of_birth"
    t.string "age", limit: 5
    t.text "address"
    t.integer "musical_instrument_id", limit: 2
    t.string "others_musical_instrument", limit: 250
    t.string "study_class", limit: 150
    t.string "other_study", limit: 250
    t.column "status", "enum('active','inactive','deleted')", default: "active"
    t.integer "role", limit: 2
    t.string "email", limit: 250
    t.string "phone_number", limit: 20
    t.text "profile_pic"
    t.string "parent_name", limit: 250
    t.string "parent_lastname", limit: 250
    t.string "parent_phoneno", limit: 20
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "relation", limit: 50
    t.integer "first_login", limit: 2
    t.date "exam_date"
    t.bigint "room"
    t.bigint "student_no"
    t.integer "coupon", default: 0
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
end

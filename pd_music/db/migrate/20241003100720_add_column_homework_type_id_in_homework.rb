class AddColumnHomeworkTypeIdInHomework < ActiveRecord::Migration[7.0]
  def change
    add_column :homeworks, :homework_type_id, :bigint, limit: 20
  end
end

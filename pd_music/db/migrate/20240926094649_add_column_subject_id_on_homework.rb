class AddColumnSubjectIdOnHomework < ActiveRecord::Migration[7.0]
  def change
    add_column :homeworks, :subject_id, :bigint, limit: 20
  end
end

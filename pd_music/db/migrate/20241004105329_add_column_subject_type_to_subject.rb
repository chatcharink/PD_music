class AddColumnSubjectTypeToSubject < ActiveRecord::Migration[7.0]
  def change
    add_column :subjects, :subject_type, :string, limit: 50
    add_column :subjects, :class_periods, :integer
  end
end

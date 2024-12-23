class AddColumnAnswerTextToQuestion < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :answer_text, :text
  end
end

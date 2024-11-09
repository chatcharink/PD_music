class AddFullScoreToHomework < ActiveRecord::Migration[7.0]
  def change
    add_column :homeworks, :full_score, :bigint, limit: 20
  end
end

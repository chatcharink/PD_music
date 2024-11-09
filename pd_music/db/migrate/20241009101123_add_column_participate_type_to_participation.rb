class AddColumnParticipateTypeToParticipation < ActiveRecord::Migration[7.0]
  def change
    add_column :participations, :participate_type, :string, limit: 50
  end
end

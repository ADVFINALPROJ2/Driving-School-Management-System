class AddExportPayloadToBatches < ActiveRecord::Migration[8.1]
  def change
    add_column :batches, :export_payload, :jsonb
  end
end
